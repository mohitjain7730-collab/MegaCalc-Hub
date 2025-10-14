'use client';

interface EmbedWidgetProps {
  calculatorSlug: string;
  calculatorName: string;
}

export function EmbedWidget({ calculatorSlug, calculatorName }: EmbedWidgetProps) {
  const embedCode = `<!-- Calculator Embed Code -->
<div style="max-width:500px; margin:auto;">
  <iframe 
    src="https://www.mycalculating.com/category/health-fitness/${calculatorSlug}" 
    width="100%" 
    height="600" 
    style="border:1px solid #ddd; border-radius:8px;"
    loading="lazy"
    title="${calculatorName} by MyCalculating.com">
  </iframe>
  <p style="text-align:center; font-size:13px; color:#555; margin-top:8px;">
    Calculator powered by 
    <a href="https://www.mycalculating.com" target="_blank" rel="dofollow noopener">
      MyCalculating.com
    </a>
  </p>
</div>
<!-- End Embed Code -->`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      // You could add a toast notification here if you have one
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '10px',
      padding: '16px',
      marginTop: '20px',
      maxWidth: '600px',
      background: '#fafafa',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3 style={{
        fontSize: '18px',
        textAlign: 'center',
        marginBottom: '12px'
      }}>
        Embed this Calculator on Your Website
      </h3>
      <p style={{
        fontSize: '14px',
        color: '#555',
        textAlign: 'center',
        marginBottom: '8px'
      }}>
        Copy the code below and paste it into your blog or website HTML.
      </p>
      
      <textarea 
        value={embedCode}
        readOnly 
        style={{
          width: '100%',
          height: '180px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '13px',
          background: '#fff'
        }}
      />

      <button 
        onClick={copyToClipboard}
        style={{
          display: 'block',
          width: '100%',
          marginTop: '10px',
          padding: '10px',
          background: '#007BFF',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '15px',
          cursor: 'pointer'
        }}
      >
        📋 Copy Embed Code
      </button>

      <p style={{
        fontSize: '12px',
        textAlign: 'center',
        color: '#777',
        marginTop: '8px'
      }}>
        Add this calculator to your site and help your readers with quick tools — with credit to MyCalculating.com.
      </p>
    </div>
  );
}
