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
        note_id = data['id']
        title = data['title']
        content = data['content']

        # Broadcast the update to the shared room, including the note ID
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'update',  # Changed to just 'update' to match method name
                'id': note_id,
                'title': title,
                'content': content,
            }
        )            
        
    async def update(self, event):
        # Send updated note data to WebSocket clients
        logger.info("Received update event in WebSocket consumer") 
        await self.send(text_data=json.dumps({
            "id": event["id"],
            "title": event["title"],
            "content": event["content"],
        }))
