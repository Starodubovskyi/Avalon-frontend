import PortProfileContainer from "@/components/ports/profile/PortProfileContainer";

export default function Page() {
  return (
    <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
      <div className="mt-4 ml-1 sm:ml-5 lg:ml-8 xl:ml-0 px-2 sm:px-3 lg:px-4 pb-4">
        <div
          className="
            w-full rounded-3xl border border-gray-200 bg-white
            shadow-[0_16px_40px_rgba(2,6,23,0.08)]
            dark:bg-white/5 dark:border-white/10
            dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
          "
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <PortProfileContainer />
          </div>
        </div>
      </div>
    </div>
  );
}
