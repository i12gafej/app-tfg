from pydantic import BaseModel


class MonitoringTemplateResponse(BaseModel):
    html_content: str
