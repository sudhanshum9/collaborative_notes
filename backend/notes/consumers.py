# consumers.py
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
import logging


logger = logging.getLogger(__name__)

class NoteConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "notes_room"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        logger.info("WebSocket connection established")
        
        # self.ping_task = asyncio.create_task(self.send_pings())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info("WebSocket connection closed with code %s", close_code)
        
    # async def send_pings(self):
    #     while True:
    #         await asyncio.sleep(30)  # Ping every 30 seconds
    #         await self.send(text_data="ping")  # Send a ping message
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 'note_update')
        
        if message_type == 'note_update':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update',
                    'id': data['id'],
                    'title': data['title'],
                    'content': data['content'],
                }
            )
        elif message_type == 'note_share':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'share_update',
                    'note_id': data['note_id'],
                    'share_type': data['share_type']  # 'team' or 'user'
                }
            )

    async def update(self, event):
        # Send updated note data to WebSocket clients
        logger.info("Received note update event in WebSocket consumer")
        await self.send(text_data=json.dumps({
            "type": "note_update",
            "id": event["id"],
            "title": event["title"],
            "content": event["content"],
        }))

    async def share_update(self, event):
        logger.info("Received note share update event")
        await self.send(text_data=json.dumps({
            "type": "note_share",
            "note_id": event["note_id"],
            # "share_type": event["share_type"]
        }))

    async def invitation_update(self, event):
        logger.info("Received team invitation update event")
        await self.send(text_data=json.dumps({
            "type": "team_invite",
            "invitation_id": event["invitation_id"],
            "team_id": event["team_id"],
            "email": event["email"],
            "action": event["action"]
        }))

    async def note_deleted(self, event):
        logger.info("Received note deletion event")
        await self.send(text_data=json.dumps({
            "type": "note_deleted",
            "id": event["id"],
            "title": event["title"],
            "content": event["content"]
        }))
