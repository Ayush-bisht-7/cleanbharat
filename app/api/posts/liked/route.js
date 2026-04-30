import { NextResponse } from 'next/server';
import { getUserLikedPostIds } from '../../../../lib/database.js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

/** Returns the list of post IDs the current user has liked. */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json([]); // Not logged in → no likes
    }

    const likedIds = await getUserLikedPostIds(Number(session.user.id));
    return NextResponse.json(likedIds);
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    return NextResponse.json([]);
  }
}
