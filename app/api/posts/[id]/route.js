import { NextResponse } from 'next/server';
import { toggleLike, deletePost } from '../../../../lib/database.js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'You must be signed in to support an issue.' }, { status: 401 });
    }

    const { id } = await params;
    const parsedId = Number(id);
    if (Number.isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
    }

    const userId = Number(session.user.id);
    const { post, liked } = await toggleLike(parsedId, userId);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Return the updated post plus whether the user now likes it
    return NextResponse.json({ ...post, userLiked: liked });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to update support' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'You must be signed in to delete a post.' }, { status: 401 });
    }

    const { id } = await params;
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