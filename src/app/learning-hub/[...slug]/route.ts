
export async function GET() {
    return new Response('410 Gone - This content has been permanently removed.', {
        status: 410,
        headers: {
            'Content-Type': 'text/plain',
        }
    });
}
