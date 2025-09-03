const puppeteer = require('puppeteer');

async function generatePDF() {
    try {
        // Launch the browser
        const browser = await puppeteer.launch();

        // Create a new page
        const page = await browser.newPage();

        // Navigate to the URL
        await page.goto('http://localhost:9000/', {
          waitUntil: ['networkidle0', 'domcontentloaded'],
        });

        await page.waitForSelector('.pagedjs_pages', { timeout: 30000 });

        await page.waitForFunction(() => {
          const pages = document.querySelectorAll('.pagedjs_page');
          // Check if we've stopped generating new pages
          return new Promise(resolve => {
            let lastCount = pages.length;
            const checkInterval = setInterval(() => {
              const currentCount = document.querySelectorAll('.pagedjs_page').length;
              if (currentCount === lastCount) {
                clearInterval(checkInterval);
                resolve(true);
              }
              lastCount = currentCount;
            }, 2000); // Check every 2 seconds
          });
        }, { timeout: 300000 });


        // Generate PDF with custom dimensions
        // 6 inches = 6 * 96 = 576 pixels
        // 8.5 inches = 8.5 * 96 = 816 pixels
        // 0.5 inches = 0.5 * 96 = 48 pixels
        await page.pdf({
            path: 'output.pdf',
            width: 576,
            height: 816,
            margin: {
                top: 72,
                right: 48,
                bottom: 72,
                left: 48
            },
            printBackground: true
        });

        // Close the browser
        await browser.close();
        
        console.log('PDF generated successfully!');
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

// Run the function
generatePDF();