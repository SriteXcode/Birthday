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

      <section>
        <h3>Timeline Events</h3>
        {(content.timeline || []).map((item, index) => (
          <div key={item.id || index} style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontWeight: 'bold', margin: '5px 0' }}>Event #{index + 1}</h4>
              <button 
                type="button"
                onClick={() => {
                  const newTimeline = (content.timeline || []).filter((_, i) => i !== index);
                  setContent({...content, timeline: newTimeline});
                }}
                style={{ background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Delete
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '5px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Date:</label>
                <input 
                  value={item.date}
                  placeholder="e.g. 2025-11-09"
                  onChange={(e) => {
                    const newTimeline = [...(content.timeline || [])];
                    newTimeline[index] = { ...newTimeline[index], date: e.target.value };
                    setContent({...content, timeline: newTimeline});
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Topic:</label>
                <input 
                  value={item.topic}
                  placeholder="e.g. First Meeting"
                  onChange={(e) => {
                    const newTimeline = [...(content.timeline || [])];
                    newTimeline[index] = { ...newTimeline[index], topic: e.target.value };
                    setContent({...content, timeline: newTimeline});
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Description:</label>
                <textarea 
                  value={item.description}
                  placeholder="e.g. The day we first met..."
                  rows={3}
                  onChange={(e) => {
                    const newTimeline = [...(content.timeline || [])];
                    newTimeline[index] = { ...newTimeline[index], description: e.target.value };
                    setContent({...content, timeline: newTimeline});
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        <button 
          type="button"
          onClick={() => {
            const newTimeline = [...(content.timeline || [])];
            newTimeline.push({
              id: Date.now().toString(),
              date: new Date().toISOString().split('T')[0],
              topic: "",
              description: ""
            });
            setContent({...content, timeline: newTimeline});
          }}
          style={{ background: '#FF69B4', color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '10px' }}
        >
          ➕ Add Timeline Event
        </button>
      </section>

      <section>
        <h3>Stories</h3>
        {(content.stories || []).map((item, index) => (
          <div key={item.id || index} style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontWeight: 'bold', margin: '5px 0' }}>Story #{index + 1}</h4>
              <button 
                type="button"
                onClick={() => {
                  const newStories = (content.stories || []).filter((_, i) => i !== index);
                  setContent({...content, stories: newStories});
                }}
                style={{ background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Delete
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '5px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Title:</label>
                <input 
                  value={item.title}
                  placeholder="e.g. A Walk Under the Stars"
                  onChange={(e) => {
                    const newStories = [...(content.stories || [])];
                    newStories[index] = { ...newStories[index], title: e.target.value };
                    setContent({...content, stories: newStories});
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Date:</label>
                <input 
                  value={item.date}
                  placeholder="e.g. 2025-12-25"
                  onChange={(e) => {
                    const newStories = [...(content.stories || [])];
                    newStories[index] = { ...newStories[index], date: e.target.value };
                    setContent({...content, stories: newStories});
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Description:</label>
                <textarea 
                  value={item.description}
                  placeholder="e.g. We took a long walk..."
                  rows={3}
                  onChange={(e) => {
                    const newStories = [...(content.stories || [])];
                    newStories[index] = { ...newStories[index], description: e.target.value };
                    setContent({...content, stories: newStories});
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        <button 
          type="button"
          onClick={() => {
            const newStories = [...(content.stories || [])];
            newStories.push({
              id: Date.now().toString(),
              title: "",
              date: new Date().toISOString().split('T')[0],
              description: ""
            });
            setContent({...content, stories: newStories});
          }}
          style={{ background: '#FF69B4', color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '10px' }}
        >
          ➕ Add Story Book Entry
        </button>
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