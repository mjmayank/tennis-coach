import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { exec } from 'child_process';
import path from 'path';

// Disable the default Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to parse form data
const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const form = new IncomingForm({ multiples: false, uploadDir: './temp' }); // Set multiples to false as we are expecting a single video file

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Parse the incoming form data (video file and timestamp)
      console.log(req)
      const { fields, files } = await parseForm(req);
      console.log(files)
      const timestamp = fields.timestamp as string;
      const videoFile = files.video[0] as formidable.File;

      // Path to the uploaded video file
      const videoFilePath = videoFile.filepath;

      // Path where the ffmpeg output (frame image) will be saved
      const outputFilePath = path.join(process.cwd(), 'temp', 'output.mp4');

      // Run ffmpeg command to extract a frame at the given timestamp
      console.log(videoFilePath)
      const command1 = `ffmpeg -i ${videoFilePath} -vf "scale=-1:720,crop=trunc(iw/2)*2:720" -c:v libx264 -crf 23 -c:a aac -b:a 192k ${outputFilePath}`

      const command2 = `ffmpeg -i ${videoFilePath} -i ${path.join(process.cwd(), 'temp', 'fed.mp4')} -filter_complex "[0:v]trim=start=0.70,setpts=PTS-STARTPTS,scale=iw*720/ih:720,scale=trunc(iw/2)*2:trunc(ih/2)*2[v0];[1:v]scale=-1:720[v1];[v0][v1]hstack=inputs=2" -c:a copy ${outputFilePath}`

      exec(command1, (error, stdout, stderr) => {
        if (error) {
          console.error('Error running ffmpeg:', error);
          return res.status(500).json({ error: 'Error running ffmpeg command' });
        }

        console.log('ffmpeg output:', stdout, stderr);
        return res.status(200).json({ message: 'ffmpeg command executed successfully', outputFilePath });
      });
    } catch (error) {
      console.error('Error parsing form data:', error);
      return res.status(500).json({ error: 'Error processing request' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}