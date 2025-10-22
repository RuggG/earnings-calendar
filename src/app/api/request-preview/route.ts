import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, company, ticker, date } = body;

    if (!email || !company || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "update@primerapp.com",
      to: "hello@primerapp.com",
      subject: "AI EARNINGS CALENDAR - New Request",
      html: `
        <h2>New Earnings Preview Request</h2>
        <p><strong>Requester Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company}</p>
        ${ticker ? `<p><strong>Ticker:</strong> ${ticker}</p>` : ""}
        <p><strong>Earnings Date:</strong> ${date}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send request" },
      { status: 500 }
    );
  }
}
