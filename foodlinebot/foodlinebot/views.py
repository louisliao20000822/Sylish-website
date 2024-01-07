from django.shortcuts import render
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseForbidden
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from foodlinebot.models import *
from linebot import LineBotApi, WebhookParser
from linebot.exceptions import InvalidSignatureError, LineBotApiError
from linebot.models import MessageEvent, TextSendMessage, TemplateSendMessage, ButtonsTemplate, PostbackTemplateAction, \
    MessageTemplateAction, FlexSendMessage, DatetimePickerAction
import requests as req
import random

line_bot_api = LineBotApi(settings.LINE_CHANNEL_ACCESS_TOKEN)
parser = WebhookParser(settings.LINE_CHANNEL_SECRET)


@csrf_exempt
def callback(request):
    if request.method == 'POST':
        signature = request.META['HTTP_X_LINE_SIGNATURE']
        body = request.body.decode('utf-8')

        try:
            events = parser.parse(body, signature)  # 傳入的事件
        except InvalidSignatureError:
            return HttpResponseForbidden()
        except LineBotApiError:
            return HttpResponseBadRequest()

        for event in events:
            if isinstance(event, MessageEvent):  # 如果有訊息事件

                mtext = event.message.text
                uid = event.source.user_id
                profile = line_bot_api.get_profile(uid)
                name = profile.display_name
                pic_url = profile.picture_url
                blist = '透肌澎澎防曬襯衫 $599\n前開衩扭結洋裝 $599'
                money = '750'

                message = []
                info = ''
                print(uid)

                if User_Info.objects.filter(uid=uid).exists() == False:
                    User_Info.objects.create(uid=uid, name=name, pic_url=pic_url, mtext=mtext, blist=blist, money=money)
                    message.append(TextSendMessage(text='會員資料新增完畢'))
                elif User_Info.objects.filter(uid=uid).exists() == True:
                    message.append(TextSendMessage(text='已經養了一隻小豬了哦!'))
                    user_info = User_Info.objects.filter(uid=uid)
                    for user in user_info:
                        info = 'UID=%s\n名字=%s\n消費紀錄:\n%s' % (user.uid, user.name, user.blist)
                        message.append(TextSendMessage(text=info))
                        # message.append(TextSendMessage(text='消費紀錄:金煌芒果 $400'))
                        # line_bot_api.reply_message(event.reply_token,message)
                        headers = {
                            'Content-Type': 'application/json'
                        }
                        import json
                        payload = json.dumps({
                            "lineuuid": str(uid),
                            "secret": "1qazxsw2"
                        })
                        response = req.request("POST", "https://app.ben2.win/api/1.0/user/getToken", headers=headers,
                                               data=payload)
                        try:
                            user_token = response.json()
                            user_token = user_token['data']['lineToken']
                            print(user_token)
                        except:
                            user_token = ""
                        if user_token != "":
                            mn = get_spend(user_token)
                        else:
                            mn = 0

                        if int(mn) < 1000:
                            Url = 'https://images.pexels.com/photos/9660/business-money-pink-coins.jpg'
                            ratio = str(round(int(mn) / 10))
                        if int(mn) > 1000 and int(mn) < 3000:
                            Url = 'https://png.pngtree.com/png-vector/20191018/ourmid/pngtree-piggy-bank-icon-for-your-design-websites-and-projects-png-image_1829671.jpg'
                            ratio = str(round((int(mn) - 1000) / 20))
                        if int(mn) > 3000 and int(mn) < 5000:
                            Url = 'https://png.pngtree.com/element_our/20190528/ourlarge/pngtree-cartoon-piggy-bank-icon-design-image_1168651.jpg'
                            ratio = str(round((int(mn) - 3000) / 20))

                        if event.message.text == '綁定帳號':
                            line_bot_api.reply_message(event.reply_token, TextSendMessage(
                                text='https://app.ben2.win/lineauth.html?id=' + str(uid)))

                        if event.message.text == '會員等級':
                            content = {
                                "type": "bubble",
                                "header": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "image",
                                            "url": Url,
                                            "flex": 1,
                                            "size": "full",
                                            "aspectRatio": "2:1",
                                            "aspectMode": "cover"
                                        }
                                    ],
                                    "paddingAll": "0px"
                                },
                                "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "Little Pig",
                                                            "size": "xl",
                                                            "color": "#1B4332",
                                                            "weight": "bold"
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "text",
                                                    "text": ratio + "%",
                                                    "margin": "lg",
                                                    "size": "xs",
                                                    "color": "#1B4332"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "filler"
                                                        }
                                                    ],
                                                    "width": str(int(mn) / 10) + "%",
                                                    "height": "6px",
                                                    "backgroundColor": "#ffffff5A"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "回饋金額:$" + str(mn),
                                                            "margin": "lg",
                                                            "size": "sm",
                                                            "color": "#1B4332"
                                                        }
                                                    ]
                                                }
                                            ],
                                            "margin": "xl",
                                            "backgroundColor": "#ffffff1A",
                                            "cornerRadius": "2px",
                                            "paddingAll": "13px"
                                        },
                                        {
                                            "type": "button",
                                            "action": {
                                                "type": "postback",
                                                "label": "消費紀錄",
                                                "data": "消費紀錄",
                                                "text": "消費紀錄"
                                            }
                                        },
                                        {
                                            "type": "button",
                                            "action": {
                                                "type": "postback",
                                                "label": "id條碼",
                                                "data": "id條碼",
                                                "text": "id條碼"
                                            }
                                        }

                                    ],
                                    "backgroundColor": "#CFE1B9"
                                }

                            }
                            line_bot_api.reply_message(event.reply_token,
                                                       FlexSendMessage(alt_text='小豬撲滿', contents=content))
                        if event.message.text == '消費紀錄':
                            content = {
                                "type": "bubble",
                                "size": "kilo",
                                "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "image",
                                            "url": "https://images.pexels.com/photos/9660/business-money-pink-coins.jpg",
                                            "size": "full",
                                            "aspectMode": "cover",
                                            "aspectRatio": "1:1",
                                            "gravity": "center"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [],
                                            "position": "absolute",
                                            "background": {
                                                "type": "linearGradient",
                                                "angle": "0deg",
                                                "endColor": "#00000000",
                                                "startColor": "#00000099"
                                            },
                                            "width": "100%",
                                            "height": "40%",
                                            "offsetBottom": "0px",
                                            "offsetStart": "0px",
                                            "offsetEnd": "0px"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "horizontal",
                                                    "contents": [
                                                        {
                                                            "type": "box",
                                                            "layout": "vertical",
                                                            "contents": [
                                                                {
                                                                    "type": "text",
                                                                    "text": "使用者名稱:" + user.name,
                                                                    "size": "md",
                                                                    "color": "#ffffff",
                                                                    "weight": "bold",
                                                                    "style": "normal"
                                                                },
                                                                {
                                                                    "type": "text",
                                                                    "text": "\n消費紀錄:\n" + blist,
                                                                    "size": "md",
                                                                    "color": "#ffffff",
                                                                    "weight": "bold",
                                                                    "style": "normal"
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            "type": "box",
                                                            "layout": "horizontal",
                                                            "contents": []
                                                        }
                                                    ],
                                                    "spacing": "xs",
                                                    "width": "1500px"
                                                }
                                            ],
                                            "position": "absolute",
                                            "offsetBottom": "0px",
                                            "offsetStart": "0px",
                                            "offsetEnd": "0px",
                                            "paddingAll": "20px"
                                        }
                                    ],
                                    "paddingAll": "0px"
                                }
                            }
                            line_bot_api.reply_message(event.reply_token,
                                                       FlexSendMessage(alt_text='消費紀錄', contents=content))
                            # line_bot_api.reply_message(event.reply_token, TextSendMessage(text=event.message.text))
                            # line_bot_api.reply_message(event.reply_token,message)
                        if event.message.text == '衣服':
                            clothes = get_clothes('all')
                            content = {
                                "type": "carousel",
                                "contents": clothes
                            }
                            line_bot_api.reply_message(event.reply_token,
                                                       FlexSendMessage(alt_text='近期的衣服', contents=content))
                        if event.message.text == '女裝':
                            clothes = get_clothes('women')
                            content = {
                                "type": "carousel",
                                "contents": clothes
                            }
                            line_bot_api.reply_message(event.reply_token,
                                                       FlexSendMessage(alt_text='近期的衣服', contents=content))

                        if event.message.text == '收藏':
                            if user_token:
                                clothes = get_collection(user_token)
                                content = {
                                    "type": "carousel",
                                    "contents": clothes
                                }

                                line_bot_api.reply_message(event.reply_token,
                                                           FlexSendMessage(alt_text='我的收藏', contents=content))
                        if event.message.text == '男裝':
                            clothes = get_clothes('men')
                            content = {
                                "type": "carousel",
                                "contents": clothes
                            }
                            line_bot_api.reply_message(event.reply_token,
                                                       FlexSendMessage(alt_text='近期的衣服', contents=content))
                        if event.message.text == '貨品狀態':
                            content = {
                                "type": "bubble",
                                "size": "kilo",
                                "header": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "FROM",
                                                    "color": "#ffffff66",
                                                    "size": "sm"
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "台北倉儲",
                                                    "color": "#ffffff",
                                                    "size": "xl",
                                                    "flex": 4,
                                                    "weight": "bold"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "TO",
                                                    "color": "#ffffff66",
                                                    "size": "sm"
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "訂購地址",
                                                    "color": "#ffffff",
                                                    "size": "xl",
                                                    "flex": 4,
                                                    "weight": "bold"
                                                }
                                            ]
                                        }
                                    ],
                                    "paddingAll": "20px",
                                    "backgroundColor": "#606C38",
                                    "spacing": "md",
                                    "height": "154px",
                                    "paddingTop": "22px"
                                },
                                "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "預計抵達時間： 兩天",
                                            "color": "#b7b7b7",
                                            "size": "xs"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "12:00",
                                                    "size": "sm",
                                                    "gravity": "center"
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "filler"
                                                        },
                                                        {
                                                            "type": "box",
                                                            "layout": "vertical",
                                                            "contents": [],
                                                            "cornerRadius": "30px",
                                                            "height": "12px",
                                                            "width": "12px",
                                                            "borderColor": "#EF454D",
                                                            "borderWidth": "2px"
                                                        },
                                                        {
                                                            "type": "filler"
                                                        }
                                                    ],
                                                    "flex": 0
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "台北倉儲",
                                                    "gravity": "center",
                                                    "flex": 4,
                                                    "size": "sm"
                                                }
                                            ],
                                            "spacing": "lg",
                                            "cornerRadius": "30px",
                                            "margin": "xl"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "baseline",
                                                    "contents": [
                                                        {
                                                            "type": "filler"
                                                        }
                                                    ],
                                                    "flex": 1
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "box",
                                                            "layout": "horizontal",
                                                            "contents": [
                                                                {
                                                                    "type": "filler"
                                                                },
                                                                {
                                                                    "type": "box",
                                                                    "layout": "vertical",
                                                                    "contents": [],
                                                                    "width": "2px",
                                                                    "backgroundColor": "#B7B7B7"
                                                                },
                                                                {
                                                                    "type": "filler"
                                                                }
                                                            ],
                                                            "flex": 1
                                                        }
                                                    ],
                                                    "width": "12px"
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "一天",
                                                    "gravity": "center",
                                                    "flex": 4,
                                                    "size": "xs",
                                                    "color": "#8c8c8c"
                                                }
                                            ],
                                            "spacing": "lg",
                                            "height": "64px"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "horizontal",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "15:00",
                                                            "gravity": "center",
                                                            "size": "sm"
                                                        }
                                                    ],
                                                    "flex": 1
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "filler"
                                                        },
                                                        {
                                                            "type": "box",
                                                            "layout": "vertical",
                                                            "contents": [],
                                                            "cornerRadius": "30px",
                                                            "width": "12px",
                                                            "height": "12px",
                                                            "borderWidth": "2px",
                                                            "borderColor": "#6486E3"
                                                        },
                                                        {
                                                            "type": "filler"
                                                        }
                                                    ],
                                                    "flex": 0
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "黑貓物流中心",
                                                    "gravity": "center",
                                                    "flex": 4,
                                                    "size": "sm"
                                                }
                                            ],
                                            "spacing": "lg",
                                            "cornerRadius": "30px"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "baseline",
                                                    "contents": [
                                                        {
                                                            "type": "filler"
                                                        }
                                                    ],
                                                    "flex": 1
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "box",
                                                            "layout": "horizontal",
                                                            "contents": [
                                                                {
                                                                    "type": "filler"
                                                                },
                                                                {
                                                                    "type": "box",
                                                                    "layout": "vertical",
                                                                    "contents": [],
                                                                    "width": "2px",
                                                                    "backgroundColor": "#6486E3"
                                                                },
                                                                {
                                                                    "type": "filler"
                                                                }
                                                            ],
                                                            "flex": 1
                                                        }
                                                    ],
                                                    "width": "12px"
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "一天",
                                                    "gravity": "center",
                                                    "flex": 4,
                                                    "size": "xs",
                                                    "color": "#8c8c8c"
                                                }
                                            ],
                                            "spacing": "lg",
                                            "height": "64px"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "16:00",
                                                    "gravity": "center",
                                                    "size": "sm"
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "filler"
                                                        },
                                                        {
                                                            "type": "box",
                                                            "layout": "vertical",
                                                            "contents": [],
                                                            "cornerRadius": "30px",
                                                            "width": "12px",
                                                            "height": "12px",
                                                            "borderColor": "#6486E3",
                                                            "borderWidth": "2px"
                                                        },
                                                        {
                                                            "type": "filler"
                                                        }
                                                    ],
                                                    "flex": 0
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "訂購地址",
                                                    "gravity": "center",
                                                    "flex": 4,
                                                    "size": "sm"
                                                }
                                            ],
                                            "spacing": "lg",
                                            "cornerRadius": "30px"
                                        }
                                    ]
                                }
                            }
                            line_bot_api.reply_message(event.reply_token,
                                                       FlexSendMessage(alt_text='貨品狀態', contents=content))
                        if event.message.text == '住':
                            message = TemplateSendMessage(alt_text='請選擇入住日期',
                                                          template=ButtonsTemplate(title='請選擇入住日期',
                                                                                   text='選擇日期', actions=[
                                                                  DatetimePickerAction(label='時間選擇',
                                                                                       data='date_postback',
                                                                                       mode='date')]
                                                                                   ))
                            line_bot_api.reply_message(event.reply_token, message)
                        # line_bot_api.reply_message(  # 回復傳入的訊息文字
                        #    event.reply_token,
                        #   TextSendMessage(text=event.message.text)
                        # )
                        if event.message.text == 'id條碼':
                            content = {
                                "type": "bubble",
                                "size": "kilo",
                                "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "image",
                                            "url": "https://www.ez2o.com/LIB/QrCode/wyZkvV4qstqHf3apt7ud7cHBCE7r7Yj7aTSJRgYxsLhdAclg2IbO69?q=L",
                                            "size": "full",
                                            "aspectMode": "cover",
                                            "aspectRatio": "1:1",
                                            "gravity": "center"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [],
                                            "position": "absolute",
                                            "background": {
                                                "type": "linearGradient",
                                                "angle": "0deg",
                                                "endColor": "#00000000",
                                                "startColor": "#00000099"
                                            },
                                            "width": "100%",
                                            "height": "40%",
                                            "offsetBottom": "0px",
                                            "offsetStart": "0px",
                                            "offsetEnd": "0px"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "box",
                                                            "layout": "baseline",
                                                            "contents": [],
                                                            "spacing": "xs"
                                                        }
                                                    ],
                                                    "spacing": "xs"
                                                }
                                            ],
                                            "position": "absolute",
                                            "offsetBottom": "0px",
                                            "offsetStart": "0px",
                                            "offsetEnd": "0px",
                                            "paddingAll": "20px"
                                        }
                                    ],
                                    "paddingAll": "0px"
                                }
                            }
                            line_bot_api.reply_message(event.reply_token,
                                                       FlexSendMessage(alt_text='龜龜龜龜龜龜', contents=content))

        return HttpResponse()
    else:
        return HttpResponseBadRequest()


# Create your views here.

def get_clothes(category="all"):
    clothes = []
    data = req.get("http://localhost:3000/api/1.0/products/" + category)
    data = data.json()
    data = data['data']
    clothes = []
    for i in data:
        clothes.append({
            "type": "bubble",
            "size": "micro",
            "hero": {
                "type": "image",
                "url": "https://app.ben2.win/assets/" + str(i['id']) + "/main.jpg",
                "size": "full",
                "aspectMode": "cover",
                "aspectRatio": "320:213"
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": i["title"],
                        "weight": "bold",
                        "size": "md",
                        "wrap": True
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "baseline",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "價格： " + str(i["price"]),
                                        "wrap": True,
                                        "color": "#8c8c8c",
                                        "size": "xxs",
                                        "flex": 5
                                    }
                                ]
                            },
                            {
                                "type": "button",
                                "action": {
                                    "type": "uri",
                                    "label": "了解更多",
                                    "uri": "https://app.ben2.win/product.html?id=" + str(i["id"])
                                },
                                "position": "relative"
                            }
                        ]
                    }
                ],
                "spacing": "sm",
                "paddingAll": "13px"
            }
        })
    return clothes


def get_collection(jwtToken):
    url = "http://localhost:3000/api/1.0/collections"
    payload = {}
    headers = {
        'Authorization': 'Bearer ' + jwtToken
    }
    response = req.request("GET", url, headers=headers, data=payload)
    data = response.json()
    data = data['data']
    clothes = []
    for i in data:
        clothes.append({
            "type": "bubble",
            "size": "micro",
            "hero": {
                "type": "image",
                "url": "https://app.ben2.win/assets/" + str(i['id']) + "/main.jpg",
                "size": "full",
                "aspectMode": "cover",
                "aspectRatio": "320:213"
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": i["title"],
                        "weight": "bold",
                        "size": "md",
                        "wrap": True
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "baseline",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "價格： " + str(i["price"]),
                                        "wrap": True,
                                        "color": "#8c8c8c",
                                        "size": "xxs",
                                        "flex": 5
                                    }
                                ]
                            },
                            {
                                "type": "button",
                                "action": {
                                    "type": "uri",
                                    "label": "了解更多",
                                    "uri": "https://app.ben2.win/product.html?id=" + str(i["id"])
                                },
                                "position": "relative"
                            }
                        ]
                    }
                ],
                "spacing": "sm",
                "paddingAll": "13px"
            }
        })
    return clothes


def get_spend(jwtToken):
    url = "https://app.ben2.win/api/1.0/user/profile"
    payload = {}
    headers = {
        'Authorization': 'Bearer ' + jwtToken
    }
    response = req.request("GET", url, headers=headers, data=payload)
    data = response.json()
    data = data['data']
    return int(data['spend'])
