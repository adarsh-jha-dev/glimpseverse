import React from 'react';

const PostItem = ({ post }) => {
  return (
    <div className="post-item">
      <div className="post-media">
        {post.images.length > 0 && (
          <div className="image-container">
            {post.images.map((image, index) => (
              <img src={image} alt={`Image ${index + 1}`} key={index} />
            ))}
          </div>
        )}
        {post.videos.length > 0 && (
          <div className="video-container">
            {post.videos.map((video, index) => (
              <video controls key={index}>
                <source src={video} type="video/mp4" />
              </video>
            ))}
          </div>
        )}
      </div>

      <div className="post-content">
        <p className="post-text">{post.content}</p>
      </div>

      <div className="post-actions">
        <div className="likes-section">
          <i className="far fa-heart"></i>
          <span>{post.likes.length}</span>
        </div>

        <div className="comments-section">
          <i className="far fa-comment"></i>
          <span>{post.comments.length}</span>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
