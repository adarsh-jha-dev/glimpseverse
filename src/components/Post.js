import React, { useState } from 'react';

const Post = () => {
  const host = 'http://localhost:5000';
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);

  const handlePhotoUpload = (e) => {
    const files = e.target.files;
    const photoArray = [];
  
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = (event) => {
        photoArray.push(event.target.result);
  
        if (photoArray.length === files.length) {
          setPhotos(photoArray);
        }
      };
  
      reader.readAsDataURL(files[i]);
    }
  };
  
  const handleVideoUpload = (e) => {
    const files = e.target.files;
    const videoArray = [];
  
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = (event) => {
        videoArray.push(event.target.result);
  
        if (videoArray.length === files.length) {
          setVideos(videoArray);
        }
      };
  
      reader.readAsDataURL(files[i]);
    }
  };
  
  

  const handleSubmit = async () => {
    const formData = {
      title: title,
      content: content,
      images: photos,
      videos: videos,
    };    

    console.log(formData);
    try {
      const response = await fetch(`${host}/api/post/createnewpost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjU0NDgyM2QyYzExNTcwNGVhY2FhOWMyIn0sImlhdCI6MTY5OTA2NzgzNn0.9is5TPZ4XhD2pUXARJ22kN8Ckusi-V8ZmMOmmQ9YDXU',
        },
        body: JSON.stringify(formData),
      })
      // .then(()=>{
      //   console.log('Post created successfully');
      // })
      // .catch((e)=>{
      //   console.log(e.message);
      // })

      if (response.ok) {
        console.log('Post created successfully.');
      } else {
        console.error('Failed to create the post.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div>
      <h2>Create a New Post</h2>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Upload Photos:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          multiple
        />
      </div>
      <div>
        <label>Upload Videos:</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          multiple
        />
      </div>
      <button onClick={handleSubmit}>Create Post</button>
    </div>
  );
};

export default Post;

