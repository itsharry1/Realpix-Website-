import React, { useState } from 'react';
import { ImageIcon, Sparkles, Download } from 'lucide-react';
import axios from 'axios';
import styles from './Button.module.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const generateImage = async () => {
    if (!prompt) return;
    
    setLoading(true);
    try {
      const response = await axios.post('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 4,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_STABILITY_API_KEY}`,
        },
        responseType: 'json'
      });

      if (response.data && Array.isArray(response.data.artifacts)) {
        const newImages = response.data.artifacts.map((artifact: { base64: string }) => 
          `data:image/png;base64,${artifact.base64}`
        );
        setImages(newImages);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Failed to generate images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, index: number) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${index}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Navigation */}
      <nav className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-6 h-6 text-gray-700" />
          <span className="text-xl font-semibold text-gray-700">Realpix</span>
        </div>
        <div>
          <a href="#" className="text-gray-600 hover:text-gray-800 font-bold">ABOUT US</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-700 mb-12">
          Input a Prompt to Generate<br />
          Realistic Images Using AI
        </h1>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-16">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write your creation"
            className="w-full px-6 py-4 rounded-full shadow-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          <button 
            className={`${styles.button} ${loading ? styles.loading : ''}`}
            onClick={generateImage}
            disabled={loading}
          >
            <Sparkles className={styles.sparkleIcon} />
            <span className={styles.buttonText}>
              {loading ? 'Generating...' : 'Generate'}
            </span>
          </button>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <div key={index} className={`${styles.imageContainer} rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow`}>
              <img
                src={image}
                alt={`AI Generated ${index + 1}`}
                className="w-full h-full object-cover aspect-square"
              />
              <button 
                className={styles.downloadButton}
                onClick={() => handleDownload(image, index)}
              >
                <Download className={styles.downloadIcon} />
                Download
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;