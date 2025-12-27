import { useState } from "react";
import contentData from "../data/content.json";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [content, setContent] = useState(contentData);

  const handleLogin = () => {
    if (password === "yadavjiii") { // Simple protection
      setIsAuthenticated(true);
    } else {
      alert("Wrong password!");
    }
  };

  const handleSave = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(content, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = "content.json";
    document.body.appendChild(element);
    element.click();
    alert("Configuration downloaded! Replace src/data/content.json with this file.");
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <h1>Admin Access</h1>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Admin Password"
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h1>Content Manager</h1>
      
      <section>
        <h3>Home Greeting</h3>
        <input 
          value={content.greeting}
          onChange={(e) => setContent({...content, greeting: e.target.value})}
        />
      </section>

      <section>
        <h3>Gallery Memories</h3>
        <p className="note">Upload photos to <code>public/images/</code> first.</p>
        {content.gallery.map((item, index) => (
          <div key={item.id} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <label>Photo {index + 1} Path:</label>
            <input 
              value={item.url}
              onChange={(e) => {
                const newGallery = [...content.gallery];
                newGallery[index].url = e.target.value;
                setContent({...content, gallery: newGallery});
              }}
            />
            <label>Caption:</label>
            <input 
              value={item.caption}
              onChange={(e) => {
                const newGallery = [...content.gallery];
                newGallery[index].caption = e.target.value;
                setContent({...content, gallery: newGallery});
              }}
            />
          </div>
        ))}
      </section>

      <section>
        <h3>Final Letter</h3>
        <input 
          value={content.letter.title}
          onChange={(e) => setContent({...content, letter: {...content.letter, title: e.target.value}})}
          placeholder="Title"
        />
        <textarea 
          value={content.letter.body}
          onChange={(e) => setContent({...content, letter: {...content.letter, body: e.target.value}})}
          placeholder="Body text..."
          rows={5}
        />
      </section>

      <div className="admin-actions">
        <button onClick={handleSave}>💾 Download Config</button>
      </div>
      
      <p className="note">
        Note: Since this is a static site, downloading will give you a file. 
        Please replace <code>src/data/content.json</code> with it to apply changes.
      </p>
    </div>
  );
}