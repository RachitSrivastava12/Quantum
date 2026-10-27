# Qubit Atlas launch film

`qubit-atlas-launch-with-audio.mp4` is a 16:9, 1080p narrated launch film introducing the course and its local quantum circuit lab. It uses the Oxide & Graphite visual direction, custom circuit diagrams, a locally generated music bed mixed for clear playback, burned-in captions, and a separate caption file.

The Bell-pair count card is labeled as one possible 100-shot sample. It illustrates finite sampling; it is not presented as a live product run or a physical Bell test. The film states that the browser simulator is classical, ideal, local, and limited to four qubits, with no device-noise model or hardware connection.

## Files

- `qubit-atlas-launch-with-audio.mp4` — finished H.264/AAC video.
- `captions.srt` — captions for players that support sidecar subtitles.
- `thumbnail.png` — 1280 × 720 cover image.
- `launch_render.py` — scene artwork, voice timing, score, and FFmpeg render source.
- `voice/scene-*.txt` — narration lines for each scene.

## Rebuild on macOS

Requires Python 3 with Pillow, FFmpeg, and the macOS `say` command. The renderer uses the installed Helvetica Neue, New York, and Menlo fonts.
The render applies a pitch-preserving 1.2× tempo adjustment to the generated voice tracks to fit the 3–4 minute brief.

```sh
python3 video/launch_render.py --prepare
for voice_file in video/voice/scene-*.txt; do
  say -v Samantha -r 100 -f "$voice_file" -o "${voice_file%.txt}.aiff"
done
python3 video/launch_render.py
```

The final render and reusable artwork stay inside this directory. Captions are included in the picture and are also available in `captions.srt`.
