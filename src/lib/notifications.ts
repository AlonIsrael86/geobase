const WEB3FORMS_KEY = "96913552-b611-44f9-ae64-d966b7870c9c";

interface NotificationDetails {
  [key: string]: string | number | undefined;
}

export async function sendNotification(action: string, details: NotificationDetails): Promise<void> {
  try {
    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `GEOBase: ${action}`,
        from_name: "GEOBase Notifications",
        action: action,
        timestamp: new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" }),
        ...details
      })
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

export async function notifyNewQuestion(question: string, category: string, userEmail?: string): Promise<void> {
  await sendNotification("שאלה חדשה נוספה", {
    question: question.substring(0, 100) + (question.length > 100 ? "..." : ""),
    category,
    user: userEmail || "לא ידוע"
  });
}

export async function notifyImport(count: number, userEmail?: string): Promise<void> {
  await sendNotification("ייבוא שאלות", {
    imported_count: count,
    user: userEmail || "לא ידוע"
  });
}

export async function notifyNewUser(email: string, name?: string): Promise<void> {
  await sendNotification("משתמש חדש נרשם", {
    user_email: email,
    user_name: name || "לא צוין"
  });
}

export async function notifyExport(count: number, userEmail?: string): Promise<void> {
  await sendNotification("ייצוא שאלות", {
    exported_count: count,
    user: userEmail || "לא ידוע"
  });
}



