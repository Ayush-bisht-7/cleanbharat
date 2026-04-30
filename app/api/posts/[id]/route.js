import { NextResponse } from 'next/server';
import { likePost, deletePost } from '../../../../lib/database.js';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const parsedId = Number(id);
    if (Number.isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
    }

    const updatedPost = await likePost(parsedId);

    if (!updatedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const parsedId = Number(id);
    if (Number.isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
    }

    const deleted = await deletePost(parsedId);

    if (!deleted) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}