import { ActivityItem } from "./activityItem";
import { DateSeparator } from "./dateSeparator";

const ActivityList = ({ activeTab }: { activeTab: string }) => {
  return (
    <div className="space-y-4">
      <DateSeparator date="Monday" />
      <ActivityItem
        icon="tag"
        title="Tag"
        time="5 min. ago"
        description="Tag GoodCustomer was assigned to customer"
        details="Performed a custom event web-desktop"
      />
      <ActivityItem
        icon="link"
        title="Page"
        time="5 h. ago"
        description={
          <>
            Visited page{" "}
            <a href="#" className="text-blue-600 font-medium">
              Pellentesque planidt
            </a>
          </>
        }
        details="Performed a custom event demo page.example.com..."
      />

      <DateSeparator date="Sunday" />
      <ActivityItem
        icon="session"
        title="Session"
        time="4 Dec. 2019"
        description="Finished session. Duration 5 m."
        details="Performed a custom event web"
      />
      <ActivityItem
        icon="session"
        title="Session"
        time="4 Dec. 2019"
        description="Started session"
        details="Performed a custom event web"
      />
    </div>
  );
};
export default ActivityList;
