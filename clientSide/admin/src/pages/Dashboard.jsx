import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import axios from "axios";


export default function Dashboard() {
    const [userCount, setUserCount] = useState(0);
    const [vendorCount, setVendorCount] = useState(0);
    const [eventCount, setEventCount] = useState(0);
    const [totalPayments, setTotalPayments] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [ongoingCount, setOngoingCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);




    const data = [
        { month: "Jan", income: 12000, bookings: 20, lastYear: 8000 },
        { month: "Feb", income: 15000, bookings: 25, lastYear: 11000 },
        { month: "Mar", income: 18000, bookings: 28, lastYear: 13000 },
        { month: "Apr", income: 14000, bookings: 22, lastYear: 10000 },
        { month: "May", income: 20000, bookings: 30, lastYear: 15000 },
        { month: "Jun", income: 25000, bookings: 35, lastYear: 18000 },
        { month: "Jul", income: 22000, bookings: 31, lastYear: 17000 },
        { month: "Aug", income: 28000, bookings: 40, lastYear: 20000 },
        { month: "Sep", income: 26000, bookings: 38, lastYear: 19000 },
        { month: "Oct", income: 30000, bookings: 45, lastYear: 21000 },
        { month: "Nov", income: 32000, bookings: 48, lastYear: 25000 },
        { month: "Dec", income: 40000, bookings: 55, lastYear: 30000 },
    ];

    const navigate = useNavigate();

    // 🔒 Protect route
    useEffect(() => {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/"); // Redirect to login if not authorized
        }
    }, [navigate]);



    useEffect(() => {
        // Fetch users from backend
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:4000/api/client/users/");
                // Assuming the response data is an array of users
                setUserCount(response.data.length);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);
    useEffect(() => {
        // Fetch users from backend
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:4000/api/vendor/users/");
                // Assuming the response data is an array of users
                setVendorCount(response.data.length);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const endpoints = [
                    // "http://localhost:4000/api/client/wedding",
                    "http://localhost:4000/api/client/birthday/all",
                    // "http://localhost:4000/api/client/functions",
                    // "http://localhost:4000/api/client/reception"
                ];

                // Fetch all event types in parallel
                const responses = await Promise.all(endpoints.map(url => axios.get(url)));

                // Sum all event counts
                const totalEvents = responses.reduce((sum, res) => {
                    return sum + res.data.length;
                }, 0);

                setEventCount(totalEvents);

            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, []);


    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get("http://localhost:4000/api/payment/all");

                const total = response.data.reduce((sum, p) => {
                    return sum + (Number(p.amount) || 0);
                }, 0);

                setTotalPayments(total);

            } catch (error) {
                console.error("Error fetching payments:", error);
            }
        };

        fetchPayments();
    }, []);
    useEffect(() => {
        axios
            .get("http://localhost:4000/api/client/birthday/status/summary")
            .then(res => {
                console.log(res.data.pending)
                console.log(res.data.ongoing)
                console.log(res.data.completed)
                setPendingCount(res.data.pending.length);
                setOngoingCount(res.data.ongoing.length);
                setCompletedCount(res.data.completed.length);
            })
            .catch(err => console.error("Error fetching event counts:", err));
    }, []);









    return (
        <div className="flex flex-col md:flex-row min-h-screen w-full bg-gray-100 overflow-hidden">
            {/* Sidebar (hidden on small screens) */}
            <div className="hidden md:block w-64 flex-shrink-0">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                <Header />

                <main
                    className="
            flex-1 bg-gray-100 
            px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-20 
            py-6 sm:py-8 lg:py-10 
            max-w-[2560px] mx-auto w-full
          "
                >
                    <h1
                        className="
              text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 
              font-semibold text-gray-800 mb-6 sm:mb-10 
              text-center md:text-left
            "
                    >
                        Welcome to Admin Dashboard 👋
                    </h1>

                    {/* Overview Cards */}
                    <div
                        className="
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 
              xl:grid-cols-5 2xl:grid-cols-6 
              gap-4 sm:gap-6 xl:gap-8 mb-10
            "
                    >
                        {[
                            { title: "Total Clients", value: userCount },
                            { title: "Total Vendors", value: vendorCount },
                            { title: "Total Events", value: eventCount },
                            { title: "Payments Received", value: totalPayments },
                            { title: "Pending Events", value: pendingCount },
                            { title: "Ongoing Events", value: ongoingCount },
                            { title: "Events Completed", value: completedCount },
                            // { title: "Active Users", value: "256" },
                            // { title: "Feedbacks", value: "92" },
                        ].map((card, index) => (
                            <div
                                key={index}
                                className="
                  bg-white p-4 sm:p-5 xl:p-6 
                  rounded-xl shadow-md hover:shadow-lg 
                  transition-all duration-200 
                  transform hover:scale-[1.02]
                "
                            >
                                <h3 className="text-gray-500 text-sm sm:text-base xl:text-lg">
                                    {card.title}
                                </h3>
                                <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-gray-800 mt-2">
                                    {card.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div
                        className="bg-white rounded-xl shadow-md p-4 sm:p-6 xl:p-8 overflow-x-auto"
                    >
                        <h2
                            className="text-lg sm:text-xl xl:text-2xl font-semibold text-gray-700 mb-6 text-center md:text-left"
                        >
                            Income & Event Bookings Overview
                        </h2>

                        {/* Monthly Income Line Chart */}
                        <div className="h-80 mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="This Year Income" />
                                    <Line type="monotone" dataKey="lastYear" stroke="#6366f1" strokeWidth={2} name="Last Year Income" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Monthly Bookings Bar Chart */}
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="bookings" fill="#f59e0b" name="Bookings Count" barSize={40} radius={[10, 10, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
