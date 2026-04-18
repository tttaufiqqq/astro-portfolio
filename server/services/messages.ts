import prisma from '../lib/prisma';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export function notifyTelegram(name: string, email: string, message: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
        console.warn('[Telegram] missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
        return;
    }
    const text = `📬 New portfolio message\nFrom: ${name} <${email}>\n\n${message}`;
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
    })
        .then(r => r.json())
        .then(data => console.log('[Telegram]', JSON.stringify(data)))
        .catch(err => console.error('[Telegram error]', err));
}

export async function createMessage(data: { name: string; email: string; message: string }) {
    return prisma.message.create({ data });
}

export async function listMessages() {
    return prisma.message.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getUnreadCount() {
    return prisma.message.count({ where: { read: false } });
}

export async function markAllRead() {
    await prisma.message.updateMany({ where: { read: false }, data: { read: true } });
}

export async function deleteMessage(id: number) {
    await prisma.message.delete({ where: { id } });
}

export async function replyToMessage(id: number, body: string) {
    const msg = await prisma.message.findUnique({ where: { id } });
    if (!msg) return null;

    if (!resend) {
        console.warn('[Reply] RESEND_API_KEY not set — skipping email in dev');
        return { skipped: true };
    }

    const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM ?? 'Portfolio <onboarding@resend.dev>',
        to: process.env.ADMIN_EMAIL ?? 'taufiq33992@gmail.com',
        replyTo: msg.email,
        subject: `Re: ${msg.name} — ${msg.email}`,
        text: `Reply to: ${msg.name} <${msg.email}>\n\n${body}\n\n---\nOriginal message: "${msg.message}"`,
    });

    if (error) throw error;
    console.log('[Reply] Sent:', data?.id);
    return { sent: true };
}
