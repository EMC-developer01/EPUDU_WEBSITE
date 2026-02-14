import Banner from "./common/Banner"
import Footer from "./common/Footer"
import Header from "./common/Header"

export default function Events() {
    const API_URL = import.meta.env.VITE_API_URL;
    const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;
    return (
        <>
            <Header />
            <Banner />
            <Footer />
        </>
    )
}