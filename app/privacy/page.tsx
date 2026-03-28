"use client";

export default function PrivacyPolicy() {
    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
            <h1>Privacy Policy</h1>
            <p>
                This application collects basic user information such as name, email,
                and calendar data to provide scheduling services.
            </p>

            <h2>Data Usage</h2>
            <p>
                We use your data only to enable booking and calendar integration.
                We do not share your data with third parties.
            </p>

            <h2>Google Data</h2>
            <p>
                This app uses Google OAuth and may access your calendar to create and manage events.
            </p>

            <h2>Contact</h2>
            <p>
                If you have any questions, contact us at: kundanjeeindia@gmail.com
            </p>
        </div>
    );
}