// components/ui/BannerIntro.tsx

export default function BannerIntro() {
  return (
    <div className="text-center pt-32 mb-0 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
        One Platform to Manage All <br />
        <span className="text-teal-600 italic">Your Ship Inspections</span>
      </h1>
      <p className="mt-4 text-gray-600 text-lg">
        Connect ship owners with qualified inspectors to simplify compliance and
        maintenance processes.
      </p>
    </div>
  );
}
