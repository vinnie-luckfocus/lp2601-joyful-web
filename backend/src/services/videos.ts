import pool from '../config/database';

export interface VideoListItem {
  id: number;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  status: string;
  game_date: string | null;
  home_team: string | null;
  away_team: string | null;
  highlights_count: number;
}

export interface VideoHighlight {
  id: number;
  title: string;
  description: string | null;
  start_time: number;
  end_time: number;
}

export interface VideoDetail {
  id: number;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  status: string;
  game_id: number | null;
  game_date: string | null;
  home_team: string | null;
  away_team: string | null;
  highlights: VideoHighlight[];
}

export async function getVideos(limit: number, offset: number): Promise<VideoListItem[]> {
  const result = await pool.query(
    `SELECT
       v.id,
       v.title,
       v.description,
       v.video_url,
       v.thumbnail_url,
       v.duration_seconds,
       v.status,
       g.scheduled_at::text AS game_date,
       home.name AS home_team,
       away.name AS away_team,
       COUNT(vh.id)::int AS highlights_count
     FROM videos v
     LEFT JOIN games g ON v.game_id = g.id
     LEFT JOIN teams home ON g.home_team_id = home.id
     LEFT JOIN teams away ON g.away_team_id = away.id
     LEFT JOIN video_highlights vh ON vh.video_id = v.id
     WHERE v.status != 'deleted'
     GROUP BY v.id, g.scheduled_at, home.name, away.name
     ORDER BY v.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

export async function getVideoById(id: number): Promise<VideoDetail | null> {
  const videoResult = await pool.query(
    `SELECT
       v.id,
       v.title,
       v.description,
       v.video_url,
       v.thumbnail_url,
       v.duration_seconds,
       v.status,
       v.game_id,
       g.scheduled_at::text AS game_date,
       home.name AS home_team,
       away.name AS away_team
     FROM videos v
     LEFT JOIN games g ON v.game_id = g.id
     LEFT JOIN teams home ON g.home_team_id = home.id
     LEFT JOIN teams away ON g.away_team_id = away.id
     WHERE v.id = $1 AND v.status != 'deleted'`,
    [id]
  );

  if (videoResult.rows.length === 0) {
    return null;
  }

  const highlightsResult = await pool.query(
    `SELECT id, title, description, start_time, end_time
     FROM video_highlights
     WHERE video_id = $1
     ORDER BY start_time ASC`,
    [id]
  );

  return {
    ...videoResult.rows[0],
    highlights: highlightsResult.rows,
  };
}

export async function createVideoUpload(
  gameId: number | null,
  title: string,
  fileName: string,
  fileSize: number,
  mimeType: string,
  uploadedBy: number
): Promise<{ id: number; presignedUrl: string; expiresAt: string }> {
  const result = await pool.query(
    `INSERT INTO videos (game_id, title, description, video_url, uploaded_by, status, file_size_bytes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [gameId, title, `Upload for ${fileName}`, '', uploadedBy, 'uploading', fileSize]
  );

  const videoId = result.rows[0].id;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // Mock presigned URL when no OSS provider is configured
  const presignedUrl = `${process.env.VITE_API_URL || 'http://localhost:3001'}/api/videos/${videoId}/direct-upload?expires=${encodeURIComponent(expiresAt)}`;

  return {
    id: videoId,
    presignedUrl,
    expiresAt,
  };
}

export async function completeVideoUpload(
  videoId: number,
  objectKey: string,
  duration: number
): Promise<boolean> {
  const result = await pool.query(
    `UPDATE videos
     SET status = 'ready',
         video_url = $2,
         duration_seconds = $3
     WHERE id = $1
       AND status = 'uploading'
     RETURNING id`,
    [videoId, objectKey, duration]
  );

  return result.rows.length > 0;
}

export async function createHighlight(
  videoId: number,
  title: string,
  description: string,
  startTime: number,
  endTime: number,
  createdBy: number
): Promise<{ id: number }> {
  const result = await pool.query(
    `INSERT INTO video_highlights (video_id, title, description, start_time, end_time, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [videoId, title, description, startTime, endTime, createdBy]
  );
  return { id: result.rows[0].id };
}

export async function deleteHighlight(videoId: number, highlightId: number): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM video_highlights
     WHERE id = $1 AND video_id = $2
     RETURNING id`,
    [highlightId, videoId]
  );
  return result.rows.length > 0;
}
