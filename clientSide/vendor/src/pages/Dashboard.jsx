import React from "react";
import Header from "../components/Header";

export default function VendorDashboard() {
    const bookings = [
        { name: "Rohit", event: "Wedding Photography", date: "20 Nov 2025", status: "Pending", color: "text-yellow-600" },
        { name: "Ananya", event: "Birthday Event", date: "22 Nov 2025", status: "Approved", color: "text-green-600" },
        { name: "Sandeep", event: "Corporate Shoot", date: "25 Nov 2025", status: "Completed", color: "text-blue-600" },
    ];

    return (
        <div className="min-h-screen w-screen bg-gray-50 overflow-x-hidden m-0 p-0">

            {/* HEADER */}
            {typeof Header === "function" && <Header />}

            {/* FULL SCREEN MAIN AREA */}
            <main className="w-full m-0 p-0 flex flex-col gap-6 sm:gap-8">

                {/* TITLE */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold px-3 sm:px-4 md:px-6">
                    Vendor Dashboard
                </h1>

                {/* SUMMARY CARDS */}
                <div className="
                    grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
                    gap-3 sm:gap-4 md:gap-6
                    w-full px-3 sm:px-4 md:px-6
                ">
                    <div className="rounded-xl bg-white shadow p-4 sm:p-5">
                        <p className="text-gray-500 text-sm">Total Bookings</p>
                        <p className="mt-2 text-3xl md:text-4xl font-bold">12</p>
                    </div>

                    <div className="rounded-xl bg-white shadow p-4 sm:p-5">
                        <p className="text-gray-500 text-sm">Pending Approvals</p>
                        <p className="mt-2 text-3xl md:text-4xl font-bold">4</p>
                    </div>

                    <div className="rounded-xl bg-white shadow p-4 sm:p-5">
                        <p className="text-gray-500 text-sm">Completed Events</p>
                        <p className="mt-2 text-3xl md:text-4xl font-bold">20</p>
                    </div>
                </div>

                {/* BOOKINGS SECTION */}
                <section className="
                    rounded-xl bg-white shadow 
                    p-3 sm:p-5 md:p-6 
                    w-full 
                    px-3 sm:px-4 md:px-6
                ">

                    {/* Section Header */}
                    <header className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Latest Bookings</h2>

                        <button className="hidden sm:block px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100">
                            View All
                        </button>
                    </header>

                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block w-full overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-100 text-left text-sm">
                                    <th className="p-3">Client Name</th>
                                    <th className="p-3">Event</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {bookings.map((b, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="p-3">{b.name}</td>
                                        <td className="p-3">{b.event}</td>
                                        <td className="p-3">{b.date}</td>
                                        <td className={`p-3 font-semibold ${b.color}`}>{b.status}</td>
                                        <td className="p-3">
                                            <button className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE CARD LIST */}
                    <div className="md:hidden space-y-3">
                        {bookings.map((b, i) => (
                            <div key={i} className="p-4 border rounded-xl bg-white shadow-sm w-full">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-medium">{b.name}</p>
                                        <p className="text-sm text-gray-600">{b.event}</p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm">{b.date}</p>
                                        <p className={`mt-1 font-semibold ${b.color}`}>{b.status}</p>
                                    </div>
                                </div>

                                <button className="mt-3 w-full px-3 py-2 border rounded-md text-sm">
                                    View
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
