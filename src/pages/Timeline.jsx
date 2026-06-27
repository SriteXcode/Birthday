import { useState, useEffect } from "react";
import contentData from "../data/content.json";
import { usePersistentState } from "../hooks/usePersistentState";
import { useNavigate } from "react-router-dom";

export default function Timeline() {
  const navigate = useNavigate();

  // Load from local storage, fallback to contentData values
  const [timeline, setTimeline] = usePersistentState("sweaty_timeline", contentData.timeline || []);
  const [stories, setStories] = usePersistentState("sweaty_stories", contentData.stories || []);

  // UI state
  const [activeTab, setActiveTab] = useState("timeline");
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isTimelineDragOver, setIsTimelineDragOver] = useState(false);
  const [isStoryDragOver, setIsStoryDragOver] = useState(false);

  // Editing state
  const [editingTimelineItem, setEditingTimelineItem] = useState(null);
  const [editingStoryItem, setEditingStoryItem] = useState(null);

  // Selected detail item state
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  // Form states - Timeline
  const [timelineDate, setTimelineDate] = useState("");
  const [timelineTopic, setTimelineTopic] = useState("");
  const [timelineImageUrl, setTimelineImageUrl] = useState("");
  const [timelineDesc, setTimelineDesc] = useState("");

  // Form states - Stories
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDate, setStoryDate] = useState("");
  const [storyImageUrl, setStoryImageUrl] = useState("");
  const [storyDesc, setStoryDesc] = useState("");

  // Helper to spawn floating hearts
  const triggerHearts = () => {
    const newHearts = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 50 + 40,
    }));
    setHearts((prev) => [...prev, ...newHearts]);
  };

  // Cleanup finished floating hearts
  useEffect(() => {
    if (hearts.length > 0) {
      const timer = setTimeout(() => {
        setHearts([]);
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [hearts]);

  // Direct Cloudinary browser upload helper
  const uploadImageToCloudinary = async (file, targetSetter) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset || cloudName === "your_cloud_name" || uploadPreset === "your_upload_preset") {
      alert("Cloudinary name or upload preset is not configured in your .env file!");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "sweatuuu/upcoming");

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Cloudinary upload failed");
      }

      const data = await response.json();
      targetSetter(data.secure_url);
    } catch (err) {
      console.error(err);
      alert("Error uploading image: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e, setter) => {
    e.preventDefault();
    setter(true);
  };

  const handleDragLeave = (e, setter) => {
    e.preventDefault();
    setter(false);
  };

  const handleDrop = (e, setter, targetSetter) => {
    e.preventDefault();
    setter(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        uploadImageToCloudinary(file, targetSetter);
      } else {
        alert("Please drop image files only!");
      }
    }
  };

  // Open Timeline Modal in Add Mode
  const openAddTimelineModal = () => {
    setEditingTimelineItem(null);
    setTimelineDate("");
    setTimelineTopic("");
    setTimelineImageUrl("");
    setTimelineDesc("");
    setIsTimelineModalOpen(true);
  };

  // Open Timeline Modal in Edit Mode
  const openEditTimelineModal = (item) => {
    setEditingTimelineItem(item);
    setTimelineDate(item.date);
    setTimelineTopic(item.topic);
    setTimelineImageUrl(item.imageUrl || "");
    setTimelineDesc(item.description);
    setIsTimelineModalOpen(true);
  };

  // Handle adding or updating timeline item
  const handleAddTimeline = (e) => {
    e.preventDefault();
    if (!timelineDate || !timelineTopic || !timelineDesc) {
      alert("Please fill in all required fields!");
      return;
    }

    if (editingTimelineItem) {
      const updatedTimeline = timeline.map((item) => {
        if (item.id === editingTimelineItem.id) {
          return {
            ...item,
            date: timelineDate,
            topic: timelineTopic,
            imageUrl: timelineImageUrl || null,
            description: timelineDesc,
          };
        }
        return item;
      });
      setTimeline(updatedTimeline);
      setEditingTimelineItem(null);
    } else {
      const newItem = {
        id: Date.now().toString(),
        date: timelineDate,
        topic: timelineTopic,
        imageUrl: timelineImageUrl || null,
        description: timelineDesc,
      };
      setTimeline([newItem, ...timeline]);
    }
    
    // Clear inputs and close modal
    setTimelineDate("");
    setTimelineTopic("");
    setTimelineImageUrl("");
    setTimelineDesc("");
    setIsTimelineModalOpen(false);
    setIsFabOpen(false);

    // Trigger sweet heart explosion animation
    triggerHearts();
  };

  // Handle deleting timeline item
  const handleDeleteTimeline = (id) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setTimeline(timeline.filter((item) => item.id !== id));
      if (editingTimelineItem?.id === id) {
        setEditingTimelineItem(null);
      }
    }
  };

  // Open Story Modal in Add Mode
  const openAddStoryModal = () => {
    setEditingStoryItem(null);
    setStoryTitle("");
    setStoryDate("");
    setStoryImageUrl("");
    setStoryDesc("");
    setIsStoryModalOpen(true);
  };

  // Open Story Modal in Edit Mode
  const openEditStoryModal = (story) => {
    setEditingStoryItem(story);
    setStoryTitle(story.title);
    setStoryDate(story.date);
    setStoryImageUrl(story.imageUrl || "");
    setStoryDesc(story.description);
    setIsStoryModalOpen(true);
  };

  // Handle adding or updating story item
  const handleAddStory = (e) => {
    e.preventDefault();
    if (!storyTitle || !storyDate || !storyDesc) {
      alert("Please fill in all required fields!");
      return;
    }

    if (editingStoryItem) {
      const updatedStories = stories.map((story) => {
        if (story.id === editingStoryItem.id) {
          return {
            ...story,
            title: storyTitle,
            date: storyDate,
            imageUrl: storyImageUrl || null,
            description: storyDesc,
          };
        }
        return story;
      });
      setStories(updatedStories);
      setEditingStoryItem(null);
    } else {
      const newItem = {
        id: Date.now().toString(),
        title: storyTitle,
        date: storyDate,
        imageUrl: storyImageUrl || null,
        description: storyDesc,
      };
      setStories([newItem, ...stories]);
    }

    // Clear inputs and close modal
    setStoryTitle("");
    setStoryDate("");
    setStoryImageUrl("");
    setStoryDesc("");
    setIsStoryModalOpen(false);
    setIsFabOpen(false);

    // Trigger animation
    triggerHearts();
  };

  // Handle deleting story item
  const handleDeleteStory = (id) => {
    if (confirm("Are you sure you want to delete this story?")) {
      setStories(stories.filter((item) => item.id !== id));
      if (editingStoryItem?.id === id) {
        setEditingStoryItem(null);
      }
    }
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    if (confirm("This will reset all timeline events and stories back to defaults. Continue?")) {
      setTimeline(contentData.timeline || []);
      setStories(contentData.stories || []);
      setEditingTimelineItem(null);
      setEditingStoryItem(null);
      setIsFabOpen(false);
      triggerHearts();
    }
  };

  return (
    <div
      className="min-h-screen pb-24 pt-28 px-4 flex flex-col items-center relative overflow-hidden select-none"
      style={{
        background: "linear-gradient(180deg, var(--lavender-light) 0%, var(--white) 100%)",
      }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 text-4xl opacity-20 pointer-events-none select-none animate-bounce">✨</div>
      <div className="absolute bottom-10 left-10 text-4xl opacity-20 pointer-events-none select-none animate-pulse">💕</div>
      <div className="absolute top-40 right-20 text-3xl opacity-15 pointer-events-none select-none">🌸</div>

      {/* Render Floating Hearts */}
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="floating-heart"
          style={{
            left: `${heart.x}vw`,
            top: `${heart.y}vh`,
            animationDelay: `${Math.random() * 0.2}s`,
          }}
        >
          ❤️
        </span>
      ))}

      <div className="w-full max-w-3xl z-10">
        {/* Header */}
        <h1 className="timeline-header-title text-5xl md:text-6xl text-center mb-2 drop-shadow-sm font-bold">
          Our Sweet Memories
        </h1>
        <p className="text-center text-sm md:text-base text-gray-500 italic mb-8">
          Every moment we spent together, locked in time.
        </p>

        {/* Tab Selection */}
        <div className="flex justify-center mb-8 gap-4">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-6 py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300 shadow-md ${
              activeTab === "timeline"
                ? "bg-rose-500 text-white scale-105"
                : "bg-white/60 hover:bg-white text-gray-700 backdrop-blur-md"
            }`}
          >
            ⏳ Timeline
          </button>
          <button
            onClick={() => setActiveTab("story")}
            className={`px-6 py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300 shadow-md ${
              activeTab === "story"
                ? "bg-rose-500 text-white scale-105"
                : "bg-white/60 hover:bg-white text-gray-700 backdrop-blur-md"
            }`}
          >
            📖 Stories
          </button>
        </div>

        {/* Nested Tab: Timeline Events */}
        {activeTab === "timeline" && (
          <div className="space-y-8 animate-fadeIn">
            {timeline.length === 0 ? (
              <div className="text-center py-16 text-gray-400 italic bg-white/40 rounded-3xl border border-dashed border-gray-200">
                No timeline events yet. Click the + button at the bottom right to add one!
              </div>
            ) : (
              <div className="relative ml-4 md:ml-8 pl-6 md:pl-10 py-2 space-y-8">
                {/* Glowing vertical gradient line */}
                <div className="timeline-glow-line"></div>

                {timeline.map((item) => (
                  <div key={item.id} className="relative group animate-fadeIn flex items-center">
                    {/* Glowing Pulse Node on Timeline */}
                    <div className="timeline-node-pulse group-hover:scale-125 transition-all duration-300"></div>

                    {/* Date-only Capsule Pill */}
                    <button
                      onClick={() => setSelectedDetailItem(item)}
                      className="timeline-date-pill"
                    >
                      <span>📅</span> {item.date}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nested Tab: Stories Tab (Scrapbook / Polaroid layout) */}
        {activeTab === "story" && (
          <div className="space-y-8 animate-fadeIn">
            {stories.length === 0 ? (
              <div className="text-center py-16 text-gray-400 italic bg-white/40 rounded-3xl border border-dashed border-gray-200">
                No stories published yet. Click the + button at the bottom right to start writing!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="story-polaroid-card flex flex-col justify-between cursor-pointer"
                    onClick={() => openEditStoryModal(story)}
                  >
                    <div>
                      {/* Premium Polaroid photo frame */}
                      <div className="polaroid-photo-frame mb-4">
                        <span className="polaroid-pin">📌</span>
                        <img
                          src={story.imageUrl || "/images/placeholder.jpg"}
                          alt={story.title}
                          className="polaroid-img"
                          onError={(e) => {
                            // Fallback to cute custom pattern if image is not loaded
                            e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%23FFF0F5'/><text x='50%' y='55%' font-size='32' text-anchor='middle'>💝</text></svg>";
                          }}
                        />
                      </div>

                      {/* Header with Title, Edit, and Delete Buttons */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-rose-400 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                            {story.date}
                          </span>
                          <h4 className="text-lg font-bold text-gray-800 mt-1">{story.title}</h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditStoryModal(story);
                            }}
                            className="text-xs text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Edit story"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStory(story.id);
                            }}
                            className="text-xs text-gray-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Delete story"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Content Description */}
                      <p className="story-polaroid-content text-sm leading-relaxed whitespace-pre-wrap mb-4 font-serif">
                        {story.description}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-3 text-right">
                      <span className="text-[10px] text-gray-400 italic">With Love ❤️</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Memory Card Detail Popup Modal --- */}
      {selectedDetailItem && (
        <div className="premium-modal-overlay" onClick={() => setSelectedDetailItem(null)}>
          <div className="premium-modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <span className="polaroid-pin" style={{ top: '-15px', fontSize: '24px' }}>📌</span>
            
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-500 border border-rose-100">
                {selectedDetailItem.date}
              </span>
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✖
              </button>
            </div>

            {/* Display image inside popup if present */}
            {selectedDetailItem.imageUrl && (
              <img
                src={selectedDetailItem.imageUrl}
                alt={selectedDetailItem.topic}
                className="detail-popup-image"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}

            <h3 className="text-2xl font-bold text-gray-800 mb-3 font-serif">
              {selectedDetailItem.topic}
            </h3>

            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-sans text-sm mb-6 max-h-60 overflow-y-auto">
              {selectedDetailItem.description}
            </p>

            {/* Actions: Edit, Delete */}
            <div className="flex justify-between items-center border-t border-gray-100 pt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    openEditTimelineModal(selectedDetailItem);
                    setSelectedDetailItem(null); // Close detail modal
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  ✏️ Edit Memory
                </button>
                <button
                  onClick={() => {
                    handleDeleteTimeline(selectedDetailItem.id);
                    setSelectedDetailItem(null); // Close detail modal
                  }}
                  className="px-4 py-2 bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-500 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  🗑️ Delete
                </button>
              </div>
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs cursor-pointer transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Premium Forms Modals --- */}

      {/* Add/Edit Memory Modal */}
      {isTimelineModalOpen && (
        <div className="premium-modal-overlay" onClick={() => setIsTimelineModalOpen(false)}>
          <div className="premium-modal-content border-t-8 border-rose-400" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>⏳</span> {editingTimelineItem ? "Edit Memory Event" : "Create New Memory"}
              </h3>
              <button
                onClick={() => setIsTimelineModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleAddTimeline} className="space-y-5">
              {/* Date and Topic Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                    <span>📅</span> Date *
                  </label>
                  <input
                    type="date"
                    value={timelineDate}
                    onChange={(e) => setTimelineDate(e.target.value)}
                    className="w-full timeline-input-field px-4 py-2.5 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                    <span>🏷️</span> Event Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. First meeting..."
                    value={timelineTopic}
                    onChange={(e) => setTimelineTopic(e.target.value)}
                    className="w-full timeline-input-field px-4 py-2.5 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Image URL & Live Preview side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                    <span>🖼️ | 📂</span> Select Image or Paste URL
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        uploadImageToCloudinary(e.target.files[0], setTimelineImageUrl);
                      }
                    }}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer mb-2"
                  />
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={timelineImageUrl}
                    onChange={(e) => setTimelineImageUrl(e.target.value)}
                    className="w-full timeline-input-field px-4 py-2 text-xs"
                  />
                </div>
                <div>
                  <div 
                    onDragOver={(e) => handleDragOver(e, setIsTimelineDragOver)}
                    onDragLeave={(e) => handleDragLeave(e, setIsTimelineDragOver)}
                    onDrop={(e) => handleDrop(e, setIsTimelineDragOver, setTimelineImageUrl)}
                    className={`image-preview-box h-[75px] rounded-2xl mt-0 shadow-inner transition-all duration-300 border-2 ${
                      isTimelineDragOver 
                        ? "border-rose-400 bg-rose-50/50 scale-105" 
                        : "border-dashed border-gray-200"
                    }`}
                  >
                    {isUploading ? (
                      <span className="text-[10px] text-rose-500 animate-pulse font-medium">Uploading... 📸</span>
                    ) : timelineImageUrl ? (
                      <img
                        src={timelineImageUrl}
                        alt="Preview"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-[9px] text-gray-400 italic text-center px-1">
                        {isTimelineDragOver ? "Drop Here! 💖" : "Drop Photo Here"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Lined Notebook Paper Description */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                  <span>📝</span> Memory Description *
                </label>
                <textarea
                  placeholder="Write the sweet details of this memory..."
                  value={timelineDesc}
                  onChange={(e) => setTimelineDesc(e.target.value)}
                  className="w-full notebook-textarea"
                  rows="4"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end mt-6 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsTimelineModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-500 font-bold rounded-full text-xs hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-50 hover:to-rose-600 text-white font-bold rounded-full text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {editingTimelineItem ? "Update Memory ✨" : "Save Memory ✨"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Story Modal */}
      {isStoryModalOpen && (
        <div className="premium-modal-overlay" onClick={() => setIsStoryModalOpen(false)}>
          <div className="premium-modal-content border-t-8 border-rose-400" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>📖</span> {editingStoryItem ? "Edit Story" : "Write Story"}
              </h3>
              <button
                onClick={() => setIsStoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleAddStory} className="space-y-5">
              {/* Title and Date Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                    <span>✨</span> Story Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A walk in the park..."
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    className="w-full timeline-input-field px-4 py-2.5 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                    <span>📅</span> Date *
                  </label>
                  <input
                    type="date"
                    value={storyDate}
                    onChange={(e) => setStoryDate(e.target.value)}
                    className="w-full timeline-input-field px-4 py-2.5 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Image URL & Live Preview side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                    <span>🖼️ | 📂</span> Select Polaroid Image or Paste URL
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        uploadImageToCloudinary(e.target.files[0], setStoryImageUrl);
                      }
                    }}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer mb-2"
                  />
                  <input
                    type="url"
                    placeholder="https://example.com/polaroid.jpg"
                    value={storyImageUrl}
                    onChange={(e) => setStoryImageUrl(e.target.value)}
                    className="w-full timeline-input-field px-4 py-2 text-xs"
                  />
                </div>
                <div>
                  <div 
                    onDragOver={(e) => handleDragOver(e, setIsStoryDragOver)}
                    onDragLeave={(e) => handleDragLeave(e, setIsStoryDragOver)}
                    onDrop={(e) => handleDrop(e, setIsStoryDragOver, setStoryImageUrl)}
                    className={`image-preview-box h-[75px] rounded-2xl mt-0 shadow-inner transition-all duration-300 border-2 ${
                      isStoryDragOver 
                        ? "border-rose-400 bg-rose-50/50 scale-105" 
                        : "border-dashed border-gray-200"
                    }`}
                  >
                    {isUploading ? (
                      <span className="text-[10px] text-rose-500 animate-pulse font-medium">Uploading... 📸</span>
                    ) : storyImageUrl ? (
                      <img
                        src={storyImageUrl}
                        alt="Preview"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-[9px] text-gray-400 italic text-center px-1">
                        {isStoryDragOver ? "Drop Here! 💖" : "Drop Photo Here"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Lined Notebook Paper Story Body */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                  <span>📝</span> Story Content *
                </label>
                <textarea
                  placeholder="Once upon a time..."
                  value={storyDesc}
                  onChange={(e) => setStoryDesc(e.target.value)}
                  className="w-full notebook-textarea"
                  rows="5"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end mt-6 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-500 font-bold rounded-full text-xs hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-full text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {editingStoryItem ? "Update Story 📖" : "Publish Story 📖"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Floating Action Button (FAB) Menu --- */}
      <div className="fab-container">
        {isFabOpen && (
          <div className="fab-menu-list">
            <button
              onClick={openAddTimelineModal}
              className="fab-action-btn"
            >
              ⏳
              <span className="fab-tooltip">Add Memory</span>
            </button>
            <button
              onClick={openAddStoryModal}
              className="fab-action-btn"
            >
              📖
              <span className="fab-tooltip">Add Story</span>
            </button>
            <button
              onClick={handleResetToDefaults}
              className="fab-action-btn"
            >
              🔄
              <span className="fab-tooltip">Reset Defaults</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="fab-action-btn"
            >
              🏠
              <span className="fab-tooltip">Go Home</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`fab-main-btn ${isFabOpen ? "active" : ""}`}
          title="Actions Menu"
        >
          ➕
        </button>
      </div>
    </div>
  );
}