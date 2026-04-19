import mongoose from 'mongoose';
import Post from './posts.model';

const validPostData = {
  description: 'Grilled chicken with rice',
  calories: 550,
  imageUrl: '/uploads/test-image.jpg',
  author: new mongoose.Types.ObjectId(),
};

describe('Post Model', () => {
  test('validates a valid post without errors', () => {
    const post = new Post(validPostData);
    const err = post.validateSync();
    expect(err).toBeUndefined();
  });

  test('rejects post without description', () => {
    const { description, ...data } = validPostData;
    const post = new Post(data);
    const err = post.validateSync();
    expect(err).toBeDefined();
    expect(err!.errors).toHaveProperty('description');
  });

  test('rejects post without calories', () => {
    const { calories, ...data } = validPostData;
    const post = new Post(data);
    const err = post.validateSync();
    expect(err).toBeDefined();
    expect(err!.errors).toHaveProperty('calories');
  });

  test('rejects post without imageUrl', () => {
    const { imageUrl, ...data } = validPostData;
    const post = new Post(data);
    const err = post.validateSync();
    expect(err).toBeDefined();
    expect(err!.errors).toHaveProperty('imageUrl');
  });

  test('rejects post without author', () => {
    const { author, ...data } = validPostData;
    const post = new Post(data);
    const err = post.validateSync();
    expect(err).toBeDefined();
    expect(err!.errors).toHaveProperty('author');
  });

  test('defaults likes to empty array', () => {
    const post = new Post(validPostData);
    expect(post.likes).toEqual([]);
  });

  test('defaults commentsCount to 0', () => {
    const post = new Post(validPostData);
    expect(post.commentsCount).toBe(0);
  });

  test('has timestamps option enabled in schema', () => {
    const schema = Post.schema;
    expect((schema as any).options.timestamps).toBe(true);
  });
});
