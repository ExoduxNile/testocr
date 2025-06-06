import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('file');
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [results, setResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const BASE_URL = 'https://tesocr-fa5p.onrender.com';

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setResults('');
    setError('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreviewUrl(url);
  };

  const processOCR = async (formData) => {
    setIsLoading(true);
    setError('');
    setResults('Processing...');

    try {
      const endpoint = activeTab === 'file' ? '/ocr/upload' : '/ocr/url';
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        body: activeTab === 'file' ? formData : JSON.stringify(formData),
        headers: activeTab === 'file' ? {} : { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OCR processing failed');
      }

      setResults(data.text);
      setError('');
    } catch (err) {
      setError(err.message);
      setResults('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (targetLang) formData.append('target_lang', targetLang);

    processOCR(formData);
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!imageUrl) {
      setError('Please enter an image URL');
      return;
    }

    const formData = {
      url: imageUrl,
      ...(targetLang && { target_lang: targetLang })
    };

    processOCR(formData);
  };

  return (
    <div className="app">
      <h1>OCR Service</h1>
      
      <div className="tab-container">
        <button 
          className={`tab ${activeTab === 'file' ? 'active' : ''}`}
          onClick={() => handleTabChange('file')}
        >
          File Upload
        </button>
        <button 
          className={`tab ${activeTab === 'url' ? 'active' : ''}`}
          onClick={() => handleTabChange('url')}
        >
          Image URL
        </button>
      </div>
      
      {activeTab === 'file' ? (
        <form onSubmit={handleFileSubmit} className="form">
          <div className="form-group">
            <label htmlFor="fileInput">Select Image:</label>
            <input 
              type="file" 
              id="fileInput" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              required
            />
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="preview-image"
                onError={() => setPreviewUrl('')}
              />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="targetLang">Target Language (optional):</label>
            <select 
              id="targetLang"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              <option value="">No translation</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
            </select>
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Extract Text'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleUrlSubmit} className="form">
          <div className="form-group">
            <label htmlFor="urlInput">Image URL:</label>
            <input 
              type="text" 
              id="urlInput" 
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              required
            />
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="preview-image"
                onError={() => setPreviewUrl('')}
              />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="urlTargetLang">Target Language (optional):</label>
            <select 
              id="urlTargetLang"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              <option value="">No translation</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
            </select>
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Extract Text'}
          </button>
        </form>
      )}
      
      <h2>Results:</h2>
      <div className={`results ${error ? 'error' : results ? 'success' : ''}`}>
        {error ? error : results}
      </div>
    </div>
  );
}

export default App;
