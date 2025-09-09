export default function RiderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-gray-50 overflow-x-hidden'>
      {/* Layout principale */}
      <div className='relative'>
        {/* Contenuto principale con spazio per sidebar */}
        <div className='lg:pl-64'>{children}</div>
      </div>
    </div>
  );
}
