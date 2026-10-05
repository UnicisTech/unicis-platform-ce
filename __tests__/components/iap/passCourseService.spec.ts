import { resolveEmbeddedVideo } from '@/components/interfaces/iap/services/passCourseService';

describe('resolveEmbeddedVideo', () => {
  it('resolves YouTube URLs', () => {
    expect(
      resolveEmbeddedVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    ).toEqual({ provider: 'youtube', videoId: 'dQw4w9WgXcQ' });
  });

  it.each([
    'https://videos.enisa.europa.eu/w/wS9DBDDiX2mHQZpK85QXNh',
    'https://videos.enisa.europa.eu/videos/watch/wS9DBDDiX2mHQZpK85QXNh',
    'https://videos.enisa.europa.eu/videos/embed/wS9DBDDiX2mHQZpK85QXNh',
  ])('resolves PeerTube URL %s', (url) => {
    expect(resolveEmbeddedVideo(url)).toEqual({
      provider: 'peertube',
      embedUrl:
        'https://videos.enisa.europa.eu/videos/embed/wS9DBDDiX2mHQZpK85QXNh',
    });
  });

  it('keeps the start time and supports full UUIDs', () => {
    expect(
      resolveEmbeddedVideo(
        'https://videos.enisa.europa.eu/videos/watch/f9f2ad9a-e1f7-4ae5-a8b1-c65f3979fb98?start=30s'
      )
    ).toEqual({
      provider: 'peertube',
      embedUrl:
        'https://videos.enisa.europa.eu/videos/embed/f9f2ad9a-e1f7-4ae5-a8b1-c65f3979fb98?start=30s',
    });
  });

  it.each([
    'http://videos.enisa.europa.eu/w/wS9DBDDiX2mHQZpK85QXNh',
    'https://videos.enisa.europa.eu/c/enisa/videos',
    'javascript:alert(1)',
    'not a url',
    '',
  ])('rejects %s', (url) => {
    expect(resolveEmbeddedVideo(url)).toBeUndefined();
  });
});
