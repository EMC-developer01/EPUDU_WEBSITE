import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Payments() {
    const [payments, setPayments] = useState([]);
    useEffect(() => { api.get("/admin/payments").then(r => setPayments(r.data)).catch(console.error) }, []);
    return <div>{payments.map(p => <div key={p._id}>{p.paymentId} — ₹{p.amount}</div>)}</div>;
}
