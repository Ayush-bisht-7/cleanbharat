import { createPost, likePost } from './lib/database.js';

async function run() {
  try {
    const post = await createPost({
      title: 'test',
      description: 'desc',
      address: 'addr',
      image: null,
    });
    console.log('created', post);
    const liked = await likePost(post.id);
    console.log('liked', liked);
  } catch (err) {
    console.error('ERR', err);
    process.exit(1);
  }
}

run();
