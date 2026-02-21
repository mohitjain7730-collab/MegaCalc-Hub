const http = require('http');

async function testUrl(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        }).on('error', err => reject(err));
    });
}

async function main() {
    console.log("Waiting for Next.js to start...");
    await new Promise(r => setTimeout(r, 2000));

    try {
        const res1 = await testUrl('http://localhost:3000/bowling-average-calculator');
        console.log("URL 1 (New):", res1.status);
        console.log("Canonical found:", res1.data.includes('<link rel="canonical" href="https://mycalculating.com/bowling-average-calculator"'));

        const res2 = await testUrl('http://localhost:3000/category/sports-training/bowling-average-calculator');
        console.log("URL 2 (Old):", res2.status);

        const res3 = await testUrl('http://localhost:3000/sitemap.xml');
        console.log("Sitemap URL:", res3.status);
        console.log("Sitemap contains new URL:", res3.data.includes('https://mycalculating.com/bowling-average-calculator'));
        console.log("Sitemap contains old URL:", res3.data.includes('https://mycalculating.com/category/sports-training/bowling-average-calculator'));
    } catch (err) {
        console.error("Test failed", err);
    }
}

main();
