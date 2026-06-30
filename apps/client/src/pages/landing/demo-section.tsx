
import { DemoMonitorCard, type DemoMonitor } from './demo-monitor-card'

export function DemoSection() {
    const demoMonitors: DemoMonitor[] = [
        {
            url: "https://api.stillup.sh",
            name: "StillUp API",
            uptimePercentage: 99.98,
            isUp: true,
        },
        {
            url: "https://dashboard.stillup.sh",
            name: "StillUp Dashboard",
            uptimePercentage: 76.5,
            isUp: false,
        },
        {
            url: "https://cdn.stillup.sh",
            name: "StillUp CDN",
            uptimePercentage: 54.3,
            isUp: false,
        },
        {
            url: "https://auth.stillup.sh",
            name: "StillUp Auth",
            uptimePercentage: 99.99,
            isUp: true,
        },
    ];

    return (
        <div className="mx-auto md:p-10 pt-12 md:pt-20 border-y">
            <div className="p-2 md:p-4">
                <div className="flex-1 text-center mb-4 md:mb-6">
                    <span className="text-lg md:text-2xl font-geist">
                        stillup.sh/dashboard
                    </span>
                    <p className="text-muted-foreground mt-1 font-light text-xs md:text-sm">
                        See real-time monitoring in action with our public demo dashboard
                    </p>
                </div>
                <div className="p-3 md:p-6 space-y-3 md:space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 bg-secondary/50 p-1.5 rounded-4xl">
                        {demoMonitors.map((monitor, index) => (
                            <DemoMonitorCard
                                key={monitor.url}
                                monitor={monitor}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
