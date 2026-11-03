import type { Person } from "@/lib/network/api";
import { contains, intParam, invalid, notFound, ok, requireUser, type DemoRequest, type RouteDef } from "../http";
import { canSeeUser, cardFor, compareUsers, findUser, isTeamUser } from "../presenters";
import type { DemoState, DemoUserRow } from "../types";

/** /people (follow graph) and /users/directory (chat partner picker) — viewers see the team and public profiles */

const FILTERS = ["all", "friends", "following", "followers"];

function visibleOthers(state: DemoState, viewer: DemoUserRow, search: string): DemoUserRow[] {
  return state.users
    .filter((u) => !u.deletedAt && u.id !== viewer.id && canSeeUser(state, viewer, u))
    // email is searchable only where it is visible: the viewer is team, the target is team (or themselves)
    .filter((u) => contains([u.firstName, u.lastName, isTeamUser(viewer) || isTeamUser(u) ? u.email : null, `${u.firstName} ${u.lastName}`], search))
    .sort(compareUsers);
}

function toPerson(state: DemoState, u: DemoUserRow, viewer: DemoUserRow): Person {
  const f = state.follows;
  const viewerId = viewer.id;
  return {
    ...cardFor(viewer, u),
    followedByMe: f.some((x) => x.followerId === viewerId && x.followeeId === u.id),
    followsMe: f.some((x) => x.followerId === u.id && x.followeeId === viewerId),
    followers: f.filter((x) => x.followeeId === u.id).length,
    following: f.filter((x) => x.followerId === u.id).length,
    posts: state.posts.filter((p) => p.authorId === u.id && !p.deletedAt).length,
  };
}

function people(req: DemoRequest) {
  const user = requireUser(req);
  const filter = req.query.filter ?? "all";
  if (!FILTERS.includes(filter)) invalid({ filter: `filter must be one of the following values: ${FILTERS.join(", ")}` });
  const rows = visibleOthers(req.state, user, req.query.search ?? "")
    .map((u) => toPerson(req.state, u, user))
    .filter((p) => {
      if (filter === "following") return p.followedByMe;
      if (filter === "followers") return p.followsMe;
      if (filter === "friends") return p.followedByMe && p.followsMe;
      return true;
    })
    .slice(0, 200);
  return ok(rows);
}

function visiblePerson(req: DemoRequest, viewer: DemoUserRow): DemoUserRow {
  const id = intParam(req);
  if (id === viewer.id) invalid({ id: "cannotFollowSelf" });
  const target = findUser(req.state, id);
  if (!target || target.deletedAt || !canSeeUser(req.state, viewer, target)) notFound("Person not found");
  return target;
}

function follow(req: DemoRequest) {
  const user = requireUser(req);
  const target = visiblePerson(req, user);
  if (!req.state.follows.some((f) => f.followerId === user.id && f.followeeId === target.id)) {
    req.state.follows.push({ followerId: user.id, followeeId: target.id });
  }
  return ok(toPerson(req.state, target, user));
}

function unfollow(req: DemoRequest) {
  const user = requireUser(req);
  const target = visiblePerson(req, user);
  req.state.follows = req.state.follows.filter((f) => !(f.followerId === user.id && f.followeeId === target.id));
  return ok(toPerson(req.state, target, user));
}

function directory(req: DemoRequest) {
  const user = requireUser(req);
  return ok(visibleOthers(req.state, user, req.query.search ?? "").slice(0, 200).map((u) => cardFor(user, u)));
}

export const peopleRoutes: RouteDef[] = [
  ["GET", "/people", people],
  ["POST", "/people/:id/follow", follow],
  ["DELETE", "/people/:id/follow", unfollow],
  ["GET", "/users/directory", directory],
];
