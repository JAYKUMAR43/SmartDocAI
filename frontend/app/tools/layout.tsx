export default function ToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-24">
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
