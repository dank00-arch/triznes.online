#!/usr/bin/env python3
"""Build a website history from a verified Telegram Desktop JSON export."""
import argparse
import hashlib
import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

MEDIA_FIELDS = ('photo', 'file', 'thumbnail')

def text_value(value):
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return ''.join(v if isinstance(v, str) else str(v.get('text', '')) for v in value if isinstance(v, (str, dict)))
    return ''

def safe_media(root, value):
    if not isinstance(value, str) or not value:
        return None
    name = Path(value)
    if name.is_absolute():
        raise ValueError('Absolute media path in export')
    candidate = (root / name).resolve()
    if not candidate.is_relative_to(root.resolve()):
        raise ValueError('Media path escapes export directory')
    if not candidate.is_file():
        return None
    return candidate

def media_kind(field, message, file):
    if field == 'thumbnail' or field == 'photo':
        return 'image'
    ext = file.suffix.lower()
    mt = message.get('media_type', '')
    if mt in ('video_file', 'video_message', 'animation') or ext in ('.mp4', '.webm', '.mov'):
        return 'video'
    if mt in ('audio_file', 'voice_message') or ext in ('.mp3', '.wav', '.m4a', '.ogg', '.opus'):
        return 'audio'
    if ext in ('.jpg', '.jpeg', '.png', '.gif', '.webp'):
        return 'image'
    return 'file'

def import_history(export_file, output, channel_id):
    export_file = Path(export_file).resolve()
    output = Path(output).resolve()
    if output.exists() and any(output.iterdir()):
        raise ValueError('Output must be empty; existing history is never overwritten')
    data = json.loads(export_file.read_text(encoding='utf-8'))
    if str(data.get('id')) != str(channel_id):
        raise ValueError('Export channel ID does not match confirmed channel ID')
    if data.get('type') != 'public_channel':
        raise ValueError('Expected a public_channel export for @bezlikiforall')
    messages = data.get('messages')
    if not isinstance(messages, list):
        raise ValueError('Export messages must be an array')
    root = export_file.parent
    output.mkdir(parents=True, exist_ok=True)
    media_dir = output / 'media'
    media_dir.mkdir(exist_ok=True)
    posts, missing, seen, duplicate_ids = [], [], set(), []
    for message in messages:
        if message.get('type') != 'message':
            continue
        mid = message.get('id')
        if not isinstance(mid, int) or mid < 1:
            raise ValueError('Invalid message ID')
        if mid in seen:
            duplicate_ids.append(mid)
            continue
        seen.add(mid)
        attachments = []
        for field in MEDIA_FIELDS:
            value = message.get(field)
            if not value:
                continue
            file = safe_media(root, value)
            if file is None:
                missing.append({'message_id': mid, 'field': field, 'reference': value})
                continue
            sha = hashlib.sha256()
            with file.open('rb') as stream:
                for block in iter(lambda: stream.read(1024 * 1024), b''):
                    sha.update(block)
            digest = sha.hexdigest()
            suffix = file.suffix.lower()
            if not re.fullmatch(r'\.[a-z0-9]{1,10}', suffix):
                suffix = '.bin'
            relative = f'media/{digest}{suffix}'
            target = output / relative
            if not target.exists():
                shutil.copyfile(file, target)
            attachments.append({'kind': media_kind(field, message, file), 'src': relative,
                                'original_filename': file.name, 'sha256': digest,
                                'size_bytes': file.stat().st_size, 'field': field})
        timestamp = message.get('date_unixtime')
        try:
            timestamp = int(timestamp)
            iso = datetime.fromtimestamp(timestamp, timezone.utc).isoformat()
        except (ValueError, TypeError, OverflowError, OSError):
            timestamp, iso = None, None
        posts.append({'id': mid, 'timestamp': timestamp, 'date': iso,
                      'original_date': message.get('date'), 'text': text_value(message.get('text')),
                      'text_entities': message.get('text_entities', []), 'media': attachments,
                      'source_url': f'https://t.me/bezlikiforall/{mid}',
                      'forwarded_from': message.get('forwarded_from'),
                      'author': message.get('author'), 'edited': message.get('edited'),
                      'missing_media': sum(x['message_id'] == mid for x in missing)})
    posts.sort(key=lambda p: (p['timestamp'] is None, p['timestamp'] or 0, p['id']))
    report = {'channel_id': channel_id, 'export_name': data.get('name'),
              'message_count': len(posts), 'unique_files': len(list(media_dir.iterdir())),
              'missing_media': missing, 'duplicate_message_ids': duplicate_ids,
              'complete': not missing and not duplicate_ids}
    manifest = {'schema_version': 1, 'source': {'handle': '@bezlikiforall', 'url': 'https://t.me/bezlikiforall',
                'channel_id': channel_id, 'name': data.get('name')}, 'posts': posts,
                'import_status': 'partial' if not report['complete'] else 'imported',
                'missing_media_count': len(missing)}
    (output / 'posts.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    (output / 'import-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    return report

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('export_json', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--confirmed-channel-id', required=True, help='Verified numeric ID of @bezlikiforall, not its title')
    args = parser.parse_args()
    report = import_history(args.export_json, args.output, args.confirmed_channel_id)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report['complete'] else 2)
