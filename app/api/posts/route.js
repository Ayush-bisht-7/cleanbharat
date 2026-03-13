import { getAllPosts, createPost, likePost } from '../../../lib/database.js';

export async function GET() {
  try {
    const posts = await getAllPosts();
    return Response.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return Response.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const postData = await request.json();

    // Basic validation
    if (!postData.title || postData.title.trim() === '') {
      return Response.json({ error: 'Title is required' }, { status: 400 });
    }

    const newPost = await createPost({
      title: postData.title.trim(),
      description: postData.description?.trim() || '',
      address: postData.address?.trim() || '',
      image: postData.image || null,
    });

    return Response.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return Response.json({ error: 'Failed to create post' }, { status: 500 });
  }
}