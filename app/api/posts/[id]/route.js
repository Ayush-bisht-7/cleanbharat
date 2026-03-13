import { likePost, deletePost } from '../../../../lib/database.js';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const updatedPost = await likePost(parseInt(id));

    if (!updatedPost) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    return Response.json(updatedPost);
  } catch (error) {
    console.error('Error liking post:', error);
    return Response.json({ error: 'Failed to like post' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const deleted = await deletePost(parseInt(id));

    if (!deleted) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return Response.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}