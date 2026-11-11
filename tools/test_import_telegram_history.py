import json
import tempfile
import unittest
from pathlib import Path
from import_telegram_history import import_history

class ImportTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.root=Path(self.temp.name)
        (self.root/'photos').mkdir()
        (self.root/'photos/a.jpg').write_bytes(b'original-photo')
        (self.root/'photos/b.jpg').write_bytes(b'original-photo')
        self.export=self.root/'result.json'
    def tearDown(self):
        self.temp.cleanup()
    def write(self,messages,channel_id=123):
        self.export.write_text(json.dumps({'id':channel_id,'name':'BEZLIKI FOR ALL','type':'public_channel','messages':messages}),encoding='utf-8')
    def test_chronology_dedup_and_missing_are_explicit(self):
        self.write([
            {'id':3,'type':'message','date_unixtime':'200','text':'later','photo':'photos/a.jpg'},
            {'id':1,'type':'message','date_unixtime':'100','text':['early ',{'type':'bold','text':'moment'}],'photo':'photos/b.jpg'},
            {'id':2,'type':'message','date_unixtime':'150','text':'voice','file':'voice_messages/missing.ogg'},
            {'id':3,'type':'message','date_unixtime':'200','text':'duplicate'}])
        report=import_history(self.export,self.root/'out','123')
        data=json.loads((self.root/'out/posts.json').read_text())
        self.assertEqual([p['id'] for p in data['posts']],[1,2,3])
        self.assertEqual(data['posts'][0]['text'],'early moment')
        self.assertEqual(report['unique_files'],1)
        self.assertEqual(report['duplicate_message_ids'],[3])
        self.assertEqual(len(report['missing_media']),1)
        self.assertFalse(report['complete'])
        self.assertEqual(data['posts'][0]['source_url'],'https://t.me/bezlikiforall/1')
        with self.assertRaises(ValueError):import_history(self.export,self.root/'out','123')
    def test_wrong_source_is_rejected(self):
        self.write([],999)
        with self.assertRaises(ValueError):import_history(self.export,self.root/'out','123')
        self.assertFalse((self.root/'out').exists())
    def test_media_cannot_escape_export(self):
        self.write([{'id':1,'type':'message','date_unixtime':'100','text':'','file':'../private.txt'}])
        with self.assertRaises(ValueError):import_history(self.export,self.root/'out','123')
        self.assertFalse((self.root/'out/posts.json').exists())
    def test_complete_export_preserves_script_as_text(self):
        self.write([{'id':1,'type':'message','date_unixtime':'100','text':'<script>alert(1)</script>','photo':'photos/a.jpg','forwarded_from':'original source'}])
        report=import_history(self.export,self.root/'out','123')
        self.assertTrue(report['complete'])
        data=json.loads((self.root/'out/posts.json').read_text())
        self.assertEqual(data['posts'][0]['forwarded_from'],'original source')
        self.assertEqual(data['posts'][0]['text'],'<script>alert(1)</script>')

if __name__=='__main__':unittest.main()
