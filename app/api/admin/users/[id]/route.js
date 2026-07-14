import { NextResponse } from 'next/server';
import { deleteUser } from '../../../../../lib/database.js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const parsedId = Number(id);
    if (Number.isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    // Do not allow deleting self
    if (parsedId === Number(session.user.id)) {
      return NextResponse.json({ error: 'Cannot delete yourself.' }, { status: 400 });
    }

    const deleted = await deleteUser(parsedId);
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
