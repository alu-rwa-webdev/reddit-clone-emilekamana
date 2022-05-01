import Post from "./Post";
import {useState,useEffect} from "react";
import axios from "axios";

function PostsListing() {
  const [comments,setComments] = useState([]);

  useEffect(() => {
    axios.get('https://em-reddit-clone-api.herokuapp.com/comment', {withCredentials:true})
      .then(response => setComments(response.data));

  }, []);


  return (
    <div className="bg-reddit_dark">
      {comments.map(comment => (
        <Post {...comment} isListing={true} />
      ))}
    </div>
  );
}

export default PostsListing;