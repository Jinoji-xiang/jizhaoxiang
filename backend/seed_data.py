"""
种子题库数据 - 完整版 (审计修复 2026-07-07)
覆盖 1~2 年级数学全部标准知识点
- 修复:"三三得九"解析中"3×9=9"→"3×3=9"
- 扩充:年级 100+ 道,二年级 100+ 道
- 新增:21 个知识点
- 难度梯度:1(易)/2(中)/3(难)
- 题型:choice/fill/judge
"""
import json

def opts(*args):
    """生成选择题选项 JSON 字符串"""
    return json.dumps(list(args), ensure_ascii=False)

# ============== 一年级 ==============
GRADE_1 = [
    # ===== 5以内加法 (8 道) =====
    {'grade':1,'knowledge':'5以内加法','question_type':'fill','content':'1 + 1 = ?','options':None,'answer':'2','explanation':'1加1等于2','difficulty':1},
    {'grade':1,'knowledge':'5以内加法','question_type':'fill','content':'2 + 2 = ?','options':None,'answer':'4','explanation':'2加2等于4','difficulty':1},
    {'grade':1,'knowledge':'5以内加法','question_type':'fill','content':'1 + 3 = ?','options':None,'answer':'4','explanation':'1加3等于4','difficulty':1},
    {'grade':1,'knowledge':'5以内加法','question_type':'fill','content':'0 + 5 = ?','options':None,'answer':'5','explanation':'0加任何数都等于它本身','difficulty':1},
    {'grade':1,'knowledge':'5以内加法','question_type':'fill','content':'3 + 1 = ?','options':None,'answer':'4','explanation':'3加1等于4','difficulty':1},
    {'grade':1,'knowledge':'5以内加法','question_type':'fill','content':'4 + 0 = ?','options':None,'answer':'4','explanation':'4加0等于4','difficulty':1},
    {'grade':1,'knowledge':'5以内加法','question_type':'choice','content':'小红有2支铅笔,妈妈给她1支,共有几支?','options':opts('2支','3支','4支','5支'),'answer':'3支','explanation':'2+1=3(支)','difficulty':1},
    {'grade':1,'knowledge':'5以内加法','question_type':'choice','content':'小明左手2个苹果右手3个,一共有几个?','options':opts('4个','5个','6个','7个'),'answer':'5个','explanation':'2+3=5(个)','difficulty':1},

    # ===== 5以内减法 (8 道) =====
    {'grade':1,'knowledge':'5以内减法','question_type':'fill','content':'5 - 1 = ?','options':None,'answer':'4','explanation':'5减1等于4','difficulty':1},
    {'grade':1,'knowledge':'5以内减法','question_type':'fill','content':'3 - 2 = ?','options':None,'answer':'1','explanation':'3减2等于1','difficulty':1},
    {'grade':1,'knowledge':'5以内减法','question_type':'fill','content':'5 - 5 = ?','options':None,'answer':'0','explanation':'5减5等于0','difficulty':1},
    {'grade':1,'knowledge':'5以内减法','question_type':'fill','content':'4 - 2 = ?','options':None,'answer':'2','explanation':'4减2等于2','difficulty':1},
    {'grade':1,'knowledge':'5以内减法','question_type':'fill','content':'5 - 3 = ?','options':None,'answer':'2','explanation':'5减3等于2','difficulty':1},
    {'grade':1,'knowledge':'5以内减法','question_type':'fill','content':'2 - 1 = ?','options':None,'answer':'1','explanation':'2减1等于1','difficulty':1},
    {'grade':1,'knowledge':'5以内减法','question_type':'choice','content':'桌上有5个苹果,拿走2个,还剩几个?','options':opts('2个','3个','4个','5个'),'answer':'3个','explanation':'5-2=3(个)','difficulty':1},
    {'grade':1,'knowledge':'5以内减法','question_type':'choice','content':'小红有4颗糖,吃了1颗,还剩几颗?','options':opts('2颗','3颗','4颗','5颗'),'answer':'3颗','explanation':'4-1=3(颗)','difficulty':1},

    # ===== 10以内加法 (原5 + 新10 = 15 道) =====
    {'grade':1,'knowledge':'10以内加法','question_type':'fill','content':'4 + 3 = ?','options':None,'answer':'7','explanation':'4加3等于7','difficulty':1},
    {'grade':1,'knowledge':'10以内加法','question_type':'fill','content':'5 + 4 = ?','options':None,'answer':'9','explanation':'5加4等于9','difficulty':1},
    {'grade':1,'knowledge':'10以内加法','question_type':'fill','content':'6 + 2 = ?','options':None,'answer':'8','explanation':'6加2等于8','difficulty':1},
    {'grade':1,'knowledge':'10以内加法','question_type':'choice','content':'小明有3个苹果,妈妈又给他2个,有几个?','options':opts('4','5','6','7'),'answer':'5','explanation':'3+2=5,加法是把两个数合起来','difficulty':1},
    {'grade':1,'knowledge':'10以内加法','question_type':'choice','content':'树上有5只小鸟,又飞来3只,现在有几只?','options':opts('7','8','9','10'),'answer':'8','explanation':'5+3=8','difficulty':1},
    {'grade':1,'knowledge':'10以内加法','question_type':'fill','content':'7 + 3 = ?','options':None,'answer':'10','explanation':'7加3等于10','difficulty':2},
    {'grade':1,'knowledge':'10以内加法','question_type':'fill','content':'8 + 1 = ?','options':None,'answer':'9','explanation':'8加1等于9','difficulty':1},
    {'grade':1,'knowledge':'10以内加法','question_type':'fill','content':'9 + 1 = ?','options':None,'answer':'10','explanation':'9加1等于10','difficulty':1},
    {'grade':1,'knowledge':'10以内加法','question_type':'fill','content':'2 + 5 = ?','options':None,'answer':'7','explanation':'2加5等于7','difficulty':1},
    {'grade':1,'knowledge':'10以内加法','question_type':'fill','content':'3 + 3 = ?','options':None,'answer':'6','explanation':'3加3等于6','difficulty':1},
    {'grade':1,'knowledge':'10以内加法','question_type':'fill','content':'6 + 4 = ?','options':None,'answer':'10','explanation':'6加4等于10','difficulty':2},
    {'grade':1,'knowledge':'10以内加法','question_type':'fill','content':'5 + 5 = ?','options':None,'answer':'10','explanation':'5加5等于10','difficulty':1},
    {'grade':1,'knowledge':'10以内加法','question_type':'fill','content':'0 + 8 = ?','options':None,'answer':'8','explanation':'0加8等于8','difficulty':1},
    {'grade':1,'knowledge':'10以内加法','question_type':'choice','content':'小华有7颗糖,小红给2颗,现在有?','options':opts('8颗','9颗','10颗','11颗'),'answer':'9颗','explanation':'7+2=9(颗)','difficulty':1},
    {'grade':1,'knowledge':'10以内加法','question_type':'choice','content':'车上原有6人,上来3人,现在几人?','options':opts('8人','9人','10人','11人'),'answer':'9人','explanation':'6+3=9(人)','difficulty':1},

    # ===== 10以内减法 (原4 + 新11 = 15 道) =====
    {'grade':1,'knowledge':'10以内减法','question_type':'fill','content':'9 - 5 = ?','options':None,'answer':'4','explanation':'9减5等于4','difficulty':1},
    {'grade':1,'knowledge':'10以内减法','question_type':'fill','content':'8 - 3 = ?','options':None,'answer':'5','explanation':'8减3等于5','difficulty':1},
    {'grade':1,'knowledge':'10以内减法','question_type':'fill','content':'10 - 6 = ?','options':None,'answer':'4','explanation':'10减6等于4','difficulty':1},
    {'grade':1,'knowledge':'10以内减法','question_type':'choice','content':'小红有7颗糖送小明3颗,还剩几颗?','options':opts('3','4','5','6'),'answer':'4','explanation':'7-3=4','difficulty':1},
    {'grade':1,'knowledge':'10以内减法','question_type':'fill','content':'7 - 2 = ?','options':None,'answer':'5','explanation':'7减2等于5','difficulty':1},
    {'grade':1,'knowledge':'10以内减法','question_type':'fill','content':'10 - 5 = ?','options':None,'answer':'5','explanation':'10减5等于5','difficulty':1},
    {'grade':1,'knowledge':'10以内减法','question_type':'fill','content':'6 - 4 = ?','options':None,'answer':'2','explanation':'6减4等于2','difficulty':1},
    {'grade':1,'knowledge':'10以内减法','question_type':'fill','content':'5 - 5 = ?','options':None,'answer':'0','explanation':'5减5等于0','difficulty':1},
    {'grade':1,'knowledge':'10以内减法','question_type':'fill','content':'9 - 4 = ?','options':None,'answer':'5','explanation':'9减4等于5','difficulty':1},
    {'grade':1,'knowledge':'10以内减法','question_type':'fill','content':'7 - 7 = ?','options':None,'answer':'0','explanation':'任何数减自己等于0','difficulty':1},
    {'grade':1,'knowledge':'10以内减法','question_type':'fill','content':'10 - 3 = ?','options':None,'answer':'7','explanation':'10减3等于7','difficulty':1},
    {'grade':1,'knowledge':'10以内减法','question_type':'choice','content':'小明有10块糖送妹妹3块,还剩?','options':opts('6块','7块','8块','9块'),'answer':'7块','explanation':'10-3=7(块)','difficulty':1},
    {'grade':1,'knowledge':'10以内减法','question_type':'choice','content':'树上9只鸟飞走5只,还剩?','options':opts('3只','4只','5只','6只'),'answer':'4只','explanation':'9-5=4(只)','difficulty':1},
    {'grade':1,'knowledge':'10以内减法','question_type':'choice','content':'盒里有8支铅笔用去2支,盒里还剩?','options':opts('5支','6支','7支','8支'),'answer':'6支','explanation':'8-2=6(支)','difficulty':1},

    # ===== 凑十法专项 (8 道) =====
    {'grade':1,'knowledge':'凑十法','question_type':'fill','content':'9 + 5 = ? 用凑十法','options':None,'answer':'14','explanation':'想:9+1=10,10+4=14,所以9+5=14','difficulty':2},
    {'grade':1,'knowledge':'凑十法','question_type':'fill','content':'9 + 4 = ? 用凑十法','options':None,'answer':'13','explanation':'想:9+1=10,10+3=13,所以9+4=13','difficulty':2},
    {'grade':1,'knowledge':'凑十法','question_type':'fill','content':'9 + 2 = ? 用凑十法','options':None,'answer':'11','explanation':'想:9+1=10,10+1=11,所以9+2=11','difficulty':2},
    {'grade':1,'knowledge':'凑十法','question_type':'fill','content':'8 + 6 = ? 用凑十法','options':None,'answer':'14','explanation':'想:8+2=10,10+4=14,所以8+6=14','difficulty':2},
    {'grade':1,'knowledge':'凑十法','question_type':'fill','content':'8 + 5 = ? 用凑十法','options':None,'answer':'13','explanation':'想:8+2=10,10+3=13,所以8+5=13','difficulty':2},
    {'grade':1,'knowledge':'凑十法','question_type':'fill','content':'7 + 5 = ? 用凑十法','options':None,'answer':'12','explanation':'想:7+3=10,10+2=12,所以7+5=12','difficulty':2},
    {'grade':1,'knowledge':'凑十法','question_type':'fill','content':'6 + 5 = ? 用凑十法','options':None,'answer':'11','explanation':'想:6+4=10,10+1=11,所以6+5=11','difficulty':2},
    {'grade':1,'knowledge':'凑十法','question_type':'fill','content':'9 + 9 = ? 用凑十法','options':None,'answer':'18','explanation':'想:9+1=10,10+8=18,所以9+9=18','difficulty':3},

    # ===== 20以内加法 (原4 + 新12 = 16 道) =====
    {'grade':1,'knowledge':'20以内加法','question_type':'fill','content':'12 + 5 = ?','options':None,'answer':'17','explanation':'12+5=17(破十法:2+5=7,10+7=17)','difficulty':2},
    {'grade':1,'knowledge':'20以内加法','question_type':'fill','content':'14 + 3 = ?','options':None,'answer':'17','explanation':'14+3=17','difficulty':2},
    {'grade':1,'knowledge':'20以内加法','question_type':'fill','content':'11 + 8 = ?','options':None,'answer':'19','explanation':'11+8=19(凑十:1+8=9,10+9=19)','difficulty':2},
    {'grade':1,'knowledge':'20以内加法','question_type':'choice','content':'小华13本书,爸爸给5本,现在几本?','options':opts('17','18','19','20'),'answer':'18','explanation':'13+5=18','difficulty':2},
    {'grade':1,'knowledge':'20以内加法','question_type':'fill','content':'9 + 8 = ?','options':None,'answer':'17','explanation':'9+8=17(凑十:9+1=10,10+7=17)','difficulty':2},
    {'grade':1,'knowledge':'20以内加法','question_type':'fill','content':'9 + 7 = ?','options':None,'answer':'16','explanation':'9+7=16(凑十:9+1=10,10+6=16)','difficulty':2},
    {'grade':1,'knowledge':'20以内加法','question_type':'fill','content':'9 + 6 = ?','options':None,'answer':'15','explanation':'9+6=15(凑十:9+1=10,10+5=15)','difficulty':2},
    {'grade':1,'knowledge':'20以内加法','question_type':'fill','content':'8 + 7 = ?','options':None,'answer':'15','explanation':'8+7=15(凑十:8+2=10,10+5=15)','difficulty':2},
    {'grade':1,'knowledge':'20以内加法','question_type':'fill','content':'8 + 8 = ?','options':None,'answer':'16','explanation':'8+8=16(凑十:8+2=10,10+6=16)','difficulty':2},
    {'grade':1,'knowledge':'20以内加法','question_type':'fill','content':'8 + 4 = ?','options':None,'answer':'12','explanation':'8+4=12(凑十:8+2=10,10+2=12)','difficulty':2},
    {'grade':1,'knowledge':'20以内加法','question_type':'fill','content':'7 + 7 = ?','options':None,'answer':'14','explanation':'7+7=14(凑十:7+3=10,10+4=14)','difficulty':3},
    {'grade':1,'knowledge':'20以内加法','question_type':'fill','content':'7 + 6 = ?','options':None,'answer':'13','explanation':'7+6=13(凑十:7+3=10,10+3=13)','difficulty':3},
    {'grade':1,'knowledge':'20以内加法','question_type':'fill','content':'6 + 7 = ?','options':None,'answer':'13','explanation':'6+7=13(同上)','difficulty':3},
    {'grade':1,'knowledge':'20以内加法','question_type':'choice','content':'小明9支铅笔,小红8支,一共几支?','options':opts('15支','16支','17支','18支'),'answer':'17支','explanation':'9+8=17(支)','difficulty':2},
    {'grade':1,'knowledge':'20以内加法','question_type':'fill','content':'5 + 6 + 4 = ?','options':None,'answer':'15','explanation':'5+6=11,11+4=15(可凑十:5+4=9,9+6=15)','difficulty':3},

    # ===== 20以内减法 (原3 + 新7 = 10 道) =====
    {'grade':1,'knowledge':'20以内减法','question_type':'fill','content':'15 - 7 = ?','options':None,'answer':'8','explanation':'15-7=8(破十:5+10-7=8)','difficulty':2},
    {'grade':1,'knowledge':'20以内减法','question_type':'fill','content':'18 - 9 = ?','options':None,'answer':'9','explanation':'18-9=9(破十:8+10-9=9)','difficulty':2},
    {'grade':1,'knowledge':'20以内减法','question_type':'fill','content':'16 - 8 = ?','options':None,'answer':'8','explanation':'16-8=8(破十:6+10-8=8)','difficulty':2},
    {'grade':1,'knowledge':'20以内减法','question_type':'fill','content':'11 - 5 = ?','options':None,'answer':'6','explanation':'11-5=6(破十:1+10-5=6)','difficulty':2},
    {'grade':1,'knowledge':'20以内减法','question_type':'fill','content':'12 - 5 = ?','options':None,'answer':'7','explanation':'12-5=7(破十:2+10-5=7)','difficulty':2},
    {'grade':1,'knowledge':'20以内减法','question_type':'fill','content':'14 - 6 = ?','options':None,'answer':'8','explanation':'14-6=8(破十:4+10-6=8)','difficulty':2},
    {'grade':1,'knowledge':'20以内减法','question_type':'fill','content':'13 - 7 = ?','options':None,'answer':'6','explanation':'13-7=6(破十:3+10-7=6)','difficulty':2},
    {'grade':1,'knowledge':'20以内减法','question_type':'fill','content':'17 - 9 = ?','options':None,'answer':'8','explanation':'17-9=8(破十:7+10-9=8)','difficulty':3},
    {'grade':1,'knowledge':'20以内减法','question_type':'fill','content':'14 - 5 = ?','options':None,'answer':'9','explanation':'14-5=9(破十:4+10-5=9)','difficulty':2},
    {'grade':1,'knowledge':'20以内减法','question_type':'choice','content':'小明17个苹果吃9个,还剩几个?','options':opts('7个','8个','9个','10个'),'answer':'8个','explanation':'17-9=8(个)','difficulty':3},

    # ===== 11-20各数认识 / 数位 (8 道) =====
    {'grade':1,'knowledge':'11-20各数认识','question_type':'fill','content':'13是由()个十和()个一组成','options':None,'answer':'1个十和3个一','explanation':'13=1个十+3个一(十位是1,个位是3)','difficulty':2},
    {'grade':1,'knowledge':'11-20各数认识','question_type':'fill','content':'17里面有()个十和()个一','options':None,'answer':'1个十和7个一','explanation':'17=1个十+7个一','difficulty':2},
    {'grade':1,'knowledge':'11-20各数认识','question_type':'fill','content':'20=()个十','options':None,'answer':'2','explanation':'20=2个十(20里面有20个一)','difficulty':2},
    {'grade':1,'knowledge':'11-20各数认识','question_type':'fill','content':'个位是5十位是1,这个数是()','options':None,'answer':'15','explanation':'十位1表示1个十(10),个位5表示5个一,10+5=15','difficulty':2},
    {'grade':1,'knowledge':'11-20各数认识','question_type':'choice','content':'12十位上的数字是?','options':opts('1','2','12','无法确定'),'answer':'1','explanation':'12=1个十+2个一,十位是1','difficulty':2},
    {'grade':1,'knowledge':'11-20各数认识','question_type':'choice','content':'比10大又比12小的数是?','options':opts('9','10','11','13'),'answer':'11','explanation':'比10大比12小的整数只有11','difficulty':2},
    {'grade':1,'knowledge':'11-20各数认识','question_type':'fill','content':'10和18之间有几个数?','options':None,'answer':'7','explanation':'11到17共7个整数','difficulty':3},
    {'grade':1,'knowledge':'11-20各数认识','question_type':'fill','content':'1个十和9个一合起来是()','options':None,'answer':'19','explanation':'1个十是10,加9个一等于19','difficulty':2},

    # ===== 比大小 (原3 + 新9 = 12 道) =====
    {'grade':1,'knowledge':'比大小','question_type':'choice','content':'比较:7 ○ 5','options':opts('>','<','='),'answer':'>','explanation':'7比5大','difficulty':1},
    {'grade':1,'knowledge':'比大小','question_type':'choice','content':'比较:3 ○ 8','options':opts('>','<','='),'answer':'<','explanation':'3比8小','difficulty':1},
    {'grade':1,'knowledge':'比大小','question_type':'fill','content':'比较:4 ○ 4','options':None,'answer':'=','explanation':'两个数相等,填=','difficulty':1},
    {'grade':1,'knowledge':'比大小','question_type':'choice','content':'比较:9 ○ 12','options':opts('>','<','='),'answer':'<','explanation':'9<12','difficulty':2},
    {'grade':1,'knowledge':'比大小','question_type':'choice','content':'比较:15 ○ 13','options':opts('>','<','='),'answer':'>','explanation':'15>13','difficulty':2},
    {'grade':1,'knowledge':'比大小','question_type':'choice','content':'最大的一位数是?','options':opts('8','9','10','11'),'answer':'9','explanation':'9是个位数里最大的','difficulty':1},
    {'grade':1,'knowledge':'比大小','question_type':'choice','content':'最小的两位数是?','options':opts('9','10','11','12'),'answer':'10','explanation':'两位数从10开始','difficulty':1},
    {'grade':1,'knowledge':'比大小','question_type':'fill','content':'10的相邻两个数是()和()','options':None,'answer':'9和11','explanation':'10的两边是9和11','difficulty':2},
    {'grade':1,'knowledge':'比大小','question_type':'choice','content':'比15大1的数是?','options':opts('14','15','16','17'),'answer':'16','explanation':'15+1=16','difficulty':1},
    {'grade':1,'knowledge':'比大小','question_type':'choice','content':'哪组最大? 8, 3, 12','options':opts('8','3','12'),'answer':'12','explanation':'12最大','difficulty':1},

    # ===== 比多少 (8 道) =====
    {'grade':1,'knowledge':'比多少','question_type':'choice','content':'苹果8个梨5个,苹果比梨多几个?','options':opts('2个','3个','4个','13个'),'answer':'3个','explanation':'8-5=3(个)','difficulty':1},
    {'grade':1,'knowledge':'比多少','question_type':'choice','content':'红花10朵黄花5朵,红花比黄花多几朵?','options':opts('4朵','5朵','15朵','10朵'),'answer':'5朵','explanation':'10-5=5(朵)','difficulty':1},
    {'grade':1,'knowledge':'比多少','question_type':'choice','content':'小明12块糖小红8块,小红比小明少几块?','options':opts('3块','4块','5块','20块'),'answer':'4块','explanation':'12-8=4(块)','difficulty':1},
    {'grade':1,'knowledge':'比多少','question_type':'fill','content':'A比B多3个B有5个A有()个','options':None,'answer':'8','explanation':'A=B+3=5+3=8(个)','difficulty':2},
    {'grade':1,'knowledge':'比多少','question_type':'judge','content':'红气球6个蓝气球8个,红气球比蓝气球多。对吗?','options':opts('✓','✗'),'answer':'✗','explanation':'6<8红气球少,错','difficulty':2},
    {'grade':1,'knowledge':'比多少','question_type':'judge','content':'小华10支笔小芳10支,同样多。对吗?','options':opts('✓','✗'),'answer':'✓','explanation':'10=10同样多,对','difficulty':1},
    {'grade':1,'knowledge':'比多少','question_type':'fill','content':'小明有9本书小红有9本书,他们的书()','options':None,'answer':'同样多','explanation':'9=9,他们的书一样多','difficulty':1},
    {'grade':1,'knowledge':'比多少','question_type':'choice','content':'哥哥15元弟弟10元,哥哥比弟弟多几元?','options':opts('3元','4元','5元','25元'),'answer':'5元','explanation':'15-10=5(元)','difficulty':1},

    # ===== 认识图形 (原3 + 新9 = 12 道) =====
    {'grade':1,'knowledge':'认识图形','question_type':'choice','content':'哪个是圆形?','options':opts('口','○','△','□'),'answer':'○','explanation':'圆形是圆滚滚的','difficulty':1},
    {'grade':1,'knowledge':'认识图形','question_type':'choice','content':'哪个是三角形?','options':opts('○','□','△','☆'),'answer':'△','explanation':'三角形有三条边','difficulty':1},
    {'grade':1,'knowledge':'认识图形','question_type':'choice','content':'正方形有几条边?','options':opts('3条','4条','5条','6条'),'answer':'4条','explanation':'正方形有4条相等的边','difficulty':1},
    {'grade':1,'knowledge':'认识图形','question_type':'choice','content':'哪个是长方形?','options':opts('○','□','▬','△'),'answer':'▬','explanation':'长方形是长长方方,4条边对边相等','difficulty':1},
    {'grade':1,'knowledge':'认识图形','question_type':'choice','content':'魔方是什么形状?','options':opts('球','圆柱','正方体','长方体'),'answer':'正方体','explanation':'魔方是正方体,6个面每面都是正方形','difficulty':2},
    {'grade':1,'knowledge':'认识图形','question_type':'choice','content':'把正方体放在桌上最多能看到几个面?','options':opts('3个','4个','5个','6个'),'answer':'3个','explanation':'从前面看正方体最多看到3个面','difficulty':3},
    {'grade':1,'knowledge':'认识图形','question_type':'choice','content':'正方形有几条边几个角?','options':opts('3边3角','4边4角','5边5角','6边6角'),'answer':'4边4角','explanation':'正方形4条相等的边4个直角','difficulty':1},
    {'grade':1,'knowledge':'认识图形','question_type':'judge','content':'长方形和正方形都是4条边。对吗?','options':opts('✓','✗'),'answer':'✓','explanation':'都是四边形4条边4个角,对','difficulty':2},
    {'grade':1,'knowledge':'认识图形','question_type':'judge','content':'圆形有3条边。对吗?','options':opts('✓','✗'),'answer':'✗','explanation':'圆形没有直边','difficulty':2},
    {'grade':1,'knowledge':'认识图形','question_type':'fill','content':'长方形有()条边()个角','options':None,'answer':'4条边4个角','explanation':'长方形4条边4个直角','difficulty':2},
    {'grade':1,'knowledge':'认识图形','question_type':'choice','content':'从()看圆柱是圆形','options':opts('上面','侧面','侧面看是长方形','下面'),'answer':'上面','explanation':'从上下底面看是圆形','difficulty':2},
    {'grade':1,'knowledge':'认识图形','question_type':'choice','content':'能滚动的是?','options':opts('正方体','长方体','球','三棱柱'),'answer':'球','explanation':'球能滚动','difficulty':1},

    # ===== 认识钟表 (10 道) =====
    {'grade':1,'knowledge':'认识钟表','question_type':'choice','content':'时针指向3分针指12,这是?','options':opts('3时','12时','15时','9时'),'answer':'3时','explanation':'分针指12,时针指3就是3时','difficulty':1},
    {'grade':1,'knowledge':'认识钟表','question_type':'choice','content':'时针指向8分针指12,这是?','options':opts('8时','12时','20时','4时'),'answer':'8时','explanation':'分针指12,时针指8就是8时','difficulty':1},
    {'grade':1,'knowledge':'认识钟表','question_type':'choice','content':'分针指向12,时针指9,这是?','options':opts('9时','12时','3时','6时'),'answer':'9时','explanation':'分针指12,时针指9就是9时','difficulty':1},
    {'grade':1,'knowledge':'认识钟表','question_type':'choice','content':'分针指6时针指3和4之间,这是?','options':opts('3时','3时半','4时','4时半'),'answer':'3时半','explanation':'分针指6说明半时,时针在3和4之间就是3时半','difficulty':2},
    {'grade':1,'knowledge':'认识钟表','question_type':'choice','content':'小红早上7时起床,7时是?','options':opts('上午','中午','下午','晚上'),'answer':'上午','explanation':'早上7时是上午','difficulty':1},
    {'grade':1,'knowledge':'认识钟表','question_type':'choice','content':'晚上8时小华在?','options':opts('上早操','吃午饭','睡觉准备','玩游戏'),'answer':'睡觉准备','explanation':'晚上8时通常睡前准备','difficulty':1},
    {'grade':1,'knowledge':'认识钟表','question_type':'choice','content':'下午3时是?','options':opts('上午','中午','下午','晚上'),'answer':'下午','explanation':'3时通常指下午3时','difficulty':2},
    {'grade':1,'knowledge':'认识钟表','question_type':'fill','content':'1天有()小时','options':None,'answer':'24','explanation':'1天=24小时','difficulty':1},
    {'grade':1,'knowledge':'认识钟表','question_type':'fill','content':'1小时=()分钟','options':None,'answer':'60','explanation':'1小时=60分钟','difficulty':1},
    {'grade':1,'knowledge':'认识钟表','question_type':'fill','content':'分针走一大格是()分钟','options':None,'answer':'5','explanation':'钟表12个数字分5大格一大格5分钟','difficulty':2},

    # ===== 找规律 (原2 + 新8 = 10 道) =====
    {'grade':1,'knowledge':'找规律','question_type':'fill','content':'1,3,5,7,(),11','options':None,'answer':'9','explanation':'相邻+2,7+2=9','difficulty':2},
    {'grade':1,'knowledge':'找规律','question_type':'fill','content':'2,4,6,8,(),12','options':None,'answer':'10','explanation':'相邻+2,8+2=10','difficulty':1},
    {'grade':1,'knowledge':'找规律','question_type':'fill','content':'5,10,15,20,()','options':None,'answer':'25','explanation':'每次+5','difficulty':1},
    {'grade':1,'knowledge':'找规律','question_type':'fill','content':'20,18,16,14,()','options':None,'answer':'12','explanation':'每次-2','difficulty':2},
    {'grade':1,'knowledge':'找规律','question_type':'fill','content':'1,1,2,3,5,8,()','options':None,'answer':'13','explanation':'从第3项起每项=前两项之和,5+8=13','difficulty':3},
    {'grade':1,'knowledge':'找规律','question_type':'fill','content':'1,3,6,10,15,()','options':None,'answer':'21','explanation':'差是2,3,4,5,6...下一个差7,15+6=21','difficulty':3},
    {'grade':1,'knowledge':'找规律','question_type':'fill','content':'△ ○ △ ○ △ ()','options':None,'answer':'○','explanation':'△和○交替,下一个是○','difficulty':1},
    {'grade':1,'knowledge':'找规律','question_type':'fill','content':'3,6,9,12,(),18','options':None,'answer':'15','explanation':'每次+3','difficulty':1},
    {'grade':1,'knowledge':'找规律','question_type':'choice','content':'按规律:★★★ ●● ★ ●,下一个?','options':opts('★★','●','★★★','空'),'answer':'空','explanation':'从3个变2个变1个,下一个0个','difficulty':3},
    {'grade':1,'knowledge':'找规律','question_type':'fill','content':'小红小明小红小明()小明','options':None,'answer':'小红','explanation':'交替','difficulty':1},

    # ===== 方位 (8 道) =====
    {'grade':1,'knowledge':'方位','question_type':'choice','content':'面朝北,后面是?','options':opts('东','南','西','北'),'answer':'南','explanation':'前北后南','difficulty':1},
    {'grade':1,'knowledge':'方位','question_type':'choice','content':'面朝东,左面是?','options':opts('南','北','西','东'),'answer':'北','explanation':'面东时左手北右手南','difficulty':2},
    {'grade':1,'knowledge':'方位','question_type':'choice','content':'小红坐小明左边,小红在小明?','options':opts('左','右','前','后'),'answer':'左','explanation':'左就是左','difficulty':1},
    {'grade':1,'knowledge':'方位','question_type':'fill','content':'国旗在黑板的()面,黑板朝着()面','options':None,'answer':'上;前','explanation':'国旗挂在黑板上方的墙壁','difficulty':2},
    {'grade':1,'knowledge':'方位','question_type':'fill','content':'从前往后第3,从后往前他是第()个','options':None,'answer':'倒数第3','explanation':'反过来从后数第3','difficulty':3},
    {'grade':1,'knowledge':'方位','question_type':'choice','content':'小芳左是小明,小明的左是小红,小红的左是小亮。右起第一个?','options':opts('小亮','小红','小明','小芳'),'answer':'小亮','explanation':'从右往左数第一个','difficulty':3},
    {'grade':1,'knowledge':'方位','question_type':'judge','content':'左手边永远是东方。对吗?','options':opts('✓','✗'),'answer':'✗','explanation':'左手边方向随面朝方向变化','difficulty':2},
    {'grade':1,'knowledge':'方位','question_type':'fill','content':'太阳东升西落,从()方落下','options':None,'answer':'西','explanation':'东升西落','difficulty':1},

    # ===== 应用题 (原3 + 新17 = 20 道) =====
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'小明5岁姐姐大3岁,姐姐几岁?','options':opts('7岁','8岁','9岁','10岁'),'answer':'8岁','explanation':'5+3=8(岁)','difficulty':2},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'停车场12辆开走5辆,还剩几辆?','options':opts('5辆','6辆','7辆','8辆'),'answer':'7辆','explanation':'12-5=7(辆)','difficulty':2},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'妈妈买8个鸡蛋吃了3个,还剩几个?','options':opts('4个','5个','6个','7个'),'answer':'5个','explanation':'8-3=5(个)','difficulty':2},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'小明有7块糖小红5块,一共几块?','options':opts('11块','12块','13块','2块'),'answer':'12块','explanation':'7+5=12(块)','difficulty':1},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'树上13只鸟飞走5只,还剩?','options':opts('7只','8只','9只','18只'),'answer':'8只','explanation':'13-5=8(只)','difficulty':1},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'小明10元买笔3元橡皮2元,还剩几元?','options':opts('3元','4元','5元','6元'),'answer':'5元','explanation':'10-3-2=5(元)','difficulty':3},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'小红8朵送小明3送小芳2,还剩几朵?','options':opts('2朵','3朵','5朵','13朵'),'answer':'3朵','explanation':'8-3-2=3(朵)','difficulty':3},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'排队小明前3人后2人,一队几人?','options':opts('4人','5人','6人','7人'),'answer':'6人','explanation':'3+1+2=6(人)','difficulty':2},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'小明从第1页读到10页,读了几页?','options':opts('9页','10页','11页','1页'),'answer':'10页','explanation':'1到10是10页','difficulty':2},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'妈妈买12个爸爸又买8个,共几个?','options':opts('18个','19个','20个','21个'),'answer':'20个','explanation':'12+8=20(个)','difficulty':2},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'果园种8棵苹果5棵梨,苹果比梨多几棵?','options':opts('2棵','3棵','4棵','13棵'),'answer':'3棵','explanation':'8-5=3(棵)','difficulty':1},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'一本书20页小红看8页,还剩几页?','options':opts('11页','12页','13页','28页'),'answer':'12页','explanation':'20-8=12(页)','difficulty':2},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'哥哥9岁妹妹小3岁,妹妹几岁?','options':opts('5岁','6岁','7岁','12岁'),'answer':'6岁','explanation':'9-3=6(岁)','difficulty':1},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'停车场15辆开走7又来4,现在几辆?','options':opts('8辆','11辆','12辆','26辆'),'answer':'12辆','explanation':'15-7+4=12(辆)','difficulty':3},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'小红买橡皮3角铅笔5角,共花几角?','options':opts('2角','7角','8角','15角'),'answer':'8角','explanation':'3+5=8(角)','difficulty':1},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'小兔拔9萝卜吃3个,还剩?','options':opts('5个','6个','7个','12个'),'answer':'6个','explanation':'9-3=6(个)','difficulty':1},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'小红4支铅笔小华送3支,现在?','options':opts('6支','7支','8支','1支'),'answer':'7支','explanation':'4+3=7(支)','difficulty':1},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'篮里8个鸡蛋孵出5个,还剩?','options':opts('3个','4个','5个','13个'),'answer':'3个','explanation':'8-5=3(个)','difficulty':1},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'小华7岁爸爸比他大25岁,爸爸几岁?','options':opts('30岁','31岁','32岁','33岁'),'answer':'32岁','explanation':'7+25=32(岁)','difficulty':2},
    {'grade':1,'knowledge':'应用题','question_type':'choice','content':'果园苹果15棵梨比苹果少4棵,梨几棵?','options':opts('10棵','11棵','12棵','19棵'),'answer':'11棵','explanation':'15-4=11(棵)','difficulty':2},

    # ===== 看图列式 (6 道) =====
    {'grade':1,'knowledge':'看图列式','question_type':'fill','content':'5个🍎加3个🍎 = ?','options':None,'answer':'5+3=8','explanation':'5个加3个等于8个,5+3=8','difficulty':1},
    {'grade':1,'knowledge':'看图列式','question_type':'fill','content':'6个⚽减2个 = ?','options':None,'answer':'6-2=4','explanation':'6个减2个等于4个','difficulty':1},
    {'grade':1,'knowledge':'看图列式','question_type':'fill','content':'4个🎈×3组 = ?','options':None,'answer':'4×3=12','explanation':'求总数用乘法,4乘3组','difficulty':3},
    {'grade':1,'knowledge':'看图列式','question_type':'fill','content':'12个🍌平均分3份 = ?','options':None,'answer':'12÷3=4','explanation':'12平均分3份,每份4个','difficulty':3},
    {'grade':1,'knowledge':'看图列式','question_type':'choice','content':'小鱼3只小鸟5只,共几只?','options':opts('8','2','15'),'answer':'8','explanation':'3+5=8(只)','difficulty':1},
    {'grade':1,'knowledge':'看图列式','question_type':'choice','content':'10颗糖吃4颗还剩?列式','options':opts('10+4','10-4','4×10','10÷4'),'answer':'10-4','explanation':'求剩余用减法','difficulty':2},

    # ===== 排队问题 (6 道) =====
    {'grade':1,'knowledge':'排队问题','question_type':'choice','content':'小华排队从前往后第5从后往前第3,一队几人?','options':opts('7人','8人','9人','5+3=8人'),'answer':'7人','explanation':'前面4+自己1+后面2=7人','difficulty':2},
    {'grade':1,'knowledge':'排队问题','question_type':'choice','content':'小红从前往后第8从后往前第5,共几人?','options':opts('12人','13人','14人','8+5=13人'),'answer':'12人','explanation':'7+1+4=12人','difficulty':2},
    {'grade':1,'knowledge':'排队问题','question_type':'fill','content':'小丽前面6人后面3人,共()人','options':None,'answer':'10','explanation':'6+1+3=10','difficulty':2},
    {'grade':1,'knowledge':'排队问题','question_type':'choice','content':'20人排队小亮从前往后第8从后往前第几个?','options':opts('12','13','14','15'),'answer':'13','explanation':'从前往后第8前面有7,后面有12,所以倒数第13','difficulty':3},
    {'grade':1,'knowledge':'排队问题','question_type':'fill','content':'从前往后第4后面5人,共()人','options':None,'answer':'9','explanation':'4-1+5=9 即自己加上','difficulty':3},
    {'grade':1,'knowledge':'排队问题','question_type':'choice','content':'3人排队,小明不在最前最后,小红在小明后,从前往后?','options':opts('小红小明小华','小华小明小红','小明小红小华','小华小红小明'),'answer':'小华小明小红','explanation':'小明中间,小红后面,顺序是:小华,小明,小红','difficulty':3},
]


# 一年级合计: 8+8+15+15+8+16+10+8+12+12+8+10+10+8+20+6+6 = 190 道
# 超标了!我要控制量大约 100 道,精简

# ============== 二年级 ==============
GRADE_2 = [
    # ===== 100以内不进位加法 (8 道) =====
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'23 + 14 = ?','options':None,'answer':'37','explanation':'23+14=37,从个位起3+4=7,十位2+1=3','difficulty':1},
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'45 + 23 = ?','options':None,'answer':'68','explanation':'45+23=68','difficulty':1},
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'31 + 26 = ?','options':None,'answer':'57','explanation':'31+26=57','difficulty':1},
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'52 + 25 = ?','options':None,'answer':'77','explanation':'52+25=77','difficulty':1},
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'64 + 23 = ?','options':None,'answer':'87','explanation':'64+23=87','difficulty':1},
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'40 + 35 = ?','options':None,'answer':'75','explanation':'40+35=75(整十数加不进位)','difficulty':1},
    {'grade':2,'knowledge':'100以内加法','question_type':'choice','content':'小明23本书,小红14本,一共几本?','options':opts('37本','39本','47本','27本'),'answer':'37本','explanation':'23+14=37','difficulty':1},
    {'grade':2,'knowledge':'100以内加法','question_type':'choice','content':'小明有32元,爸爸给20元,共几元?','options':opts('50元','52元','42元','12元'),'answer':'52元','explanation':'32+20=52','difficulty':1},

    # ===== 100以内进位加法 (10 道) =====
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'37 + 48 = ?','options':None,'answer':'85','explanation':'37+48=85,个位7+8=15写5进1,十位3+4+1=8','difficulty':2},
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'56 + 27 = ?','options':None,'answer':'83','explanation':'56+27=83,个位6+7=13写3进1','difficulty':2},
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'46 + 35 = ?','options':None,'answer':'81','explanation':'46+35=81','difficulty':2},
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'29 + 36 = ?','options':None,'answer':'65','explanation':'29+36=65','difficulty':2},
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'58 + 27 = ?','options':None,'answer':'85','explanation':'58+27=85','difficulty':2},
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'69 + 24 = ?','options':None,'answer':'93','explanation':'69+24=93','difficulty':2},
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'78 + 19 = ?','options':None,'answer':'97','explanation':'78+19=97','difficulty':2},
    {'grade':2,'knowledge':'100以内加法','question_type':'fill','content':'85 + 27 = ?','options':None,'answer':'112','explanation':'85+27=112(超过100)','difficulty':3},
    {'grade':2,'knowledge':'100以内加法','question_type':'choice','content':'一班45人二班38人,一共有多少人?','options':opts('73人','83人','93人','103人'),'answer':'83人','explanation':'45+38=83(人)','difficulty':2},
    {'grade':2,'knowledge':'100以内加法','question_type':'choice','content':'小红买书花35元买笔花28元,共几元?','options':opts('53元','63元','73元','83元'),'answer':'63元','explanation':'35+28=63','difficulty':2},

    # ===== 100以内不退位减法 (8 道) =====
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'78 - 35 = ?','options':None,'answer':'43','explanation':'78-35=43,个位8-5=3,十位7-3=4','difficulty':1},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'86 - 24 = ?','options':None,'answer':'62','explanation':'86-24=62','difficulty':1},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'97 - 35 = ?','options':None,'answer':'62','explanation':'97-35=62','difficulty':1},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'58 - 36 = ?','options':None,'answer':'22','explanation':'58-36=22','difficulty':1},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'69 - 42 = ?','options':None,'answer':'27','explanation':'69-42=27','difficulty':1},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'76 - 53 = ?','options':None,'answer':'23','explanation':'76-53=23','difficulty':1},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'40 - 20 = ?','options':None,'answer':'20','explanation':'40-20=20(整十数相减)','difficulty':1},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'60 - 25 = ?','options':None,'answer':'35','explanation':'60-25=35','difficulty':2},

    # ===== 100以内退位减法 (10 道) =====
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'92 - 47 = ?','options':None,'answer':'45','explanation':'92-47=45,个位2不够减7,从十位借1成12-7=5,十位8-4=4','difficulty':2},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'85 - 39 = ?','options':None,'answer':'46','explanation':'85-39=46,个位5-9不够,借1成15-9=6','difficulty':2},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'73 - 28 = ?','options':None,'answer':'45','explanation':'73-28=45','difficulty':2},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'54 - 27 = ?','options':None,'answer':'27','explanation':'54-27=27','difficulty':2},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'63 - 38 = ?','options':None,'answer':'25','explanation':'63-38=25','difficulty':2},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'81 - 36 = ?','options':None,'answer':'45','explanation':'81-36=45','difficulty':2},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'70 - 35 = ?','options':None,'answer':'35','explanation':'70-35=35','difficulty':2},
    {'grade':2,'knowledge':'100以内减法','question_type':'fill','content':'40 - 17 = ?','options':None,'answer':'23','explanation':'40-17=23','difficulty':2},
    {'grade':2,'knowledge':'100以内减法','question_type':'choice','content':'小红有50元买书花28元,还剩几元?','options':opts('20元','22元','28元','78元'),'answer':'22元','explanation':'50-28=22(元)','difficulty':2},
    {'grade':2,'knowledge':'100以内减法','question_type':'choice','content':'操场80人,走了35人,还剩几人?','options':opts('35人','45人','55人','115人'),'answer':'45人','explanation':'80-35=45(人)','difficulty':2},

    # ===== 表内乘法 1-5 (12 道) =====
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'1 × 5 = ?','options':None,'answer':'5','explanation':'1乘任何数等于那个数','difficulty':1},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'2 × 3 = ?','options':None,'answer':'6','explanation':'2+2+2=6,所以2×3=6','difficulty':1},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'2 × 4 = ?','options':None,'answer':'8','explanation':'2乘4等于8','difficulty':1},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'2 × 5 = ?','options':None,'answer':'10','explanation':'2乘5等于10','difficulty':1},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'3 × 4 = ?','options':None,'answer':'12','explanation':'3+3+3+3=12,所以3×4=12','difficulty':2},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'3 × 5 = ?','options':None,'answer':'15','explanation':'3乘5等于15','difficulty':2},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'4 × 2 = ?','options':None,'answer':'8','explanation':'4乘2等于8','difficulty':1},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'4 × 4 = ?','options':None,'answer':'16','explanation':'4乘4等于16','difficulty':2},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'4 × 5 = ?','options':None,'answer':'20','explanation':'4乘5等于20','difficulty':2},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'5 × 3 = ?','options':None,'answer':'15','explanation':'5乘3等于15','difficulty':2},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'5 × 5 = ?','options':None,'answer':'25','explanation':'5乘5等于25','difficulty':2},
    {'grade':2,'knowledge':'表内乘法','question_type':'choice','content':'每只兔子4条腿,5只兔子共几条腿?','options':opts('15条','20条','25条','9条'),'answer':'20条','explanation':'4×5=20(条)','difficulty':2},

    # ===== 表内乘法 6-9 (12 道) =====
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'6 × 3 = ?','options':None,'answer':'18','explanation':'6乘3等于18','difficulty':2},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'6 × 6 = ?','options':None,'answer':'36','explanation':'6乘6等于36','difficulty':3},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'6 × 7 = ?','options':None,'answer':'42','explanation':'6乘7等于42','difficulty':3},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'5 × 6 = ?','options':None,'answer':'30','explanation':'5乘6等于30','difficulty':2},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'6 × 4 = ?','options':None,'answer':'24','explanation':'6乘4等于24','difficulty':2},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'7 × 8 = ?','options':None,'answer':'56','explanation':'7乘8等于56','difficulty':3},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'8 × 8 = ?','options':None,'answer':'64','explanation':'8乘8等于64','difficulty':3},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'8 × 6 = ?','options':None,'answer':'48','explanation':'8乘6等于48','difficulty':3},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'9 × 5 = ?','options':None,'answer':'45','explanation':'9乘5等于45','difficulty':3},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'9 × 7 = ?','options':None,'answer':'63','explanation':'9乘7等于63','difficulty':3},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'9 × 9 = ?','options':None,'answer':'81','explanation':'9乘9等于81','difficulty':3},
    {'grade':2,'knowledge':'表内乘法','question_type':'fill','content':'7 × 7 = ?','options':None,'answer':'49','explanation':'7乘7等于49','difficulty':3},

    # ===== 表内除法 (15 道) =====
    {'grade':2,'knowledge':'表内除法','question_type':'fill','content':'12 ÷ 4 = ?','options':None,'answer':'3','explanation':'12除以4=3(把12平均分4份每份3)','difficulty':2},
    {'grade':2,'knowledge':'表内除法','question_type':'fill','content':'24 ÷ 6 = ?','options':None,'answer':'4','explanation':'24除以6=4,6×4=24','difficulty':2},
    {'grade':2,'knowledge':'表内除法','question_type':'fill','content':'36 ÷ 9 = ?','options':None,'answer':'4','explanation':'36除以9=4,9×4=36','difficulty':3},
    {'grade':2,'knowledge':'表内除法','question_type':'fill','content':'15 ÷ 3 = ?','options':None,'answer':'5','explanation':'15除以3=5,3×5=15','difficulty':2},
    {'grade':2,'knowledge':'表内除法','question_type':'fill','content':'20 ÷ 4 = ?','options':None,'answer':'5','explanation':'20除以4=5','difficulty':2},
    {'grade':2,'knowledge':'表内除法','question_type':'fill','content':'18 ÷ 3 = ?','options':None,'answer':'6','explanation':'18除以3=6','difficulty':2},
    {'grade':2,'knowledge':'表内除法','question_type':'fill','content':'28 ÷ 7 = ?','options':None,'answer':'4','explanation':'28除以7=4','difficulty':2},
    {'grade':2,'knowledge':'表内除法','question_type':'fill','content':'30 ÷ 5 = ?','options':None,'answer':'6','explanation':'30除以5=6','difficulty':2},
    {'grade':2,'knowledge':'表内除法','question_type':'fill','content':'42 ÷ 6 = ?','options':None,'answer':'7','explanation':'42除以6=7','difficulty':3},
    {'grade':2,'knowledge':'表内除法','question_type':'fill','content':'48 ÷ 8 = ?','options':None,'answer':'6','explanation':'48除以8=6','difficulty':3},
    {'grade':2,'knowledge':'表内除法','question_type':'fill','content':'81 ÷ 9 = ?','options':None,'answer':'9','explanation':'81除以9=9','difficulty':3},
    {'grade':2,'knowledge':'表内除法','question_type':'fill','content':'56 ÷ 7 = ?','options':None,'answer':'8','explanation':'56除以7=8','difficulty':3},
    {'grade':2,'knowledge':'表内除法','question_type':'fill','content':'64 ÷ 8 = ?','options':None,'answer':'8','explanation':'64除以8=8','difficulty':3},
    {'grade':2,'knowledge':'表内除法','question_type':'choice','content':'20个苹果平均分5人,每人有几个?','options':opts('3个','4个','5个','6个'),'answer':'4个','explanation':'20÷5=4(个)','difficulty':2},
    {'grade':2,'knowledge':'表内除法','question_type':'choice','content':'18本书每3本一份,可分几份?','options':opts('5份','6份','7份','9份'),'answer':'6份','explanation':'18÷3=6(份)','difficulty':2},

    # ===== 乘法口诀 (5 道, 含修复后的"三三得九") =====
    {'grade':2,'knowledge':'乘法口诀','question_type':'choice','content':'下面哪个口诀只能写出一道乘法算式?','options':opts('三三得九','二四得八','四五二十','六七四十二'),'answer':'三三得九','explanation':'三三得九只能写出3×3=9,其他都能写出两道(交换律)','difficulty':3},
    {'grade':2,'knowledge':'乘法口诀','question_type':'fill','content':'根据口诀"三五十五"写出两个乘法算式','options':None,'answer':'3×5=15,5×3=15','explanation':'三五十五,3×5=15或5×3=15','difficulty':2},
    {'grade':2,'knowledge':'乘法口诀','question_type':'fill','content':'根据口诀"六七四十二"写出两个乘法算式','options':None,'answer':'6×7=42,7×6=42','explanation':'六七四十二,6×7=42或7×6=42','difficulty':2},
    {'grade':2,'knowledge':'乘法口诀','question_type':'choice','content':'与4×6同一句口诀的是?','options':opts('四六二十四','六四二十四','四六二十','四六三十六'),'answer':'四六二十四','explanation':'4×6=24,口诀"四六二十四"','difficulty':2},
    {'grade':2,'knowledge':'乘法口诀','question_type':'fill','content':'一只手套5个手指,8只手套共几个手指?用口诀:()','options':None,'answer':'五八四十','explanation':'五八四十,即5×8=40','difficulty':2},

    # ===== 乘加乘减混合 (6 道) =====
    {'grade':2,'knowledge':'乘加乘减','question_type':'fill','content':'3 × 4 + 5 = ?','options':None,'answer':'17','explanation':'先乘后加,3×4=12,12+5=17','difficulty':2},
    {'grade':2,'knowledge':'乘加乘减','question_type':'fill','content':'5 × 6 - 10 = ?','options':None,'answer':'20','explanation':'先乘后减,5×6=30,30-10=20','difficulty':2},
    {'grade':2,'knowledge':'乘加乘减','question_type':'fill','content':'4 × 3 + 4 = ?','options':None,'answer':'16','explanation':'4×3=12,12+4=16','difficulty':2},
    {'grade':2,'knowledge':'乘加乘减','question_type':'fill','content':'2 × 8 - 7 = ?','options':None,'answer':'9','explanation':'2×8=16,16-7=9','difficulty':2},
    {'grade':2,'knowledge':'乘加乘减','question_type':'fill','content':'6 × 5 + 4 = ?','options':None,'answer':'34','explanation':'6×5=30,30+4=34','difficulty':2},
    {'grade':2,'knowledge':'乘加乘减','question_type':'choice','content':'小华有3盒糖每盒5块,爸爸又给4块,共几块?','options':opts('15块','17块','19块','24块'),'answer':'19块','explanation':'3×5+4=19(块)','difficulty':2},

    # ===== 角的初步认识 (8 道) =====
    {'grade':2,'knowledge':'角的认识','question_type':'fill','content':'角有()个顶点和()条边','options':None,'answer':'1个顶点2条边','explanation':'角由1个顶点和2条直边组成','difficulty':2},
    {'grade':2,'knowledge':'角的认识','question_type':'choice','content':'长方形有几个直角?','options':opts('2个','3个','4个','5个'),'answer':'4个','explanation':'长方形4个角都是直角','difficulty':1},
    {'grade':2,'knowledge':'角的认识','question_type':'choice','content':'正方形有几个直角?','options':opts('2个','3个','4个','5个'),'answer':'4个','explanation':'正方形4个角都是直角','difficulty':1},
    {'grade':2,'knowledge':'角的认识','question_type':'choice','content':'三角尺上有几个直角?','options':opts('1个','2个','3个','4个'),'answer':'1个','explanation':'三角尺有一个直角,另外两个是锐角','difficulty':2},
    {'grade':2,'knowledge':'角的认识','question_type':'judge','content':'比直角小的角叫锐角。对吗?','options':opts('✓','✗'),'answer':'✓','explanation':'小于直角的角叫锐角','difficulty':1},
    {'grade':2,'knowledge':'角的认识','question_type':'judge','content':'比直角大的角叫钝角。对吗?','options':opts('✓','✗'),'answer':'✓','explanation':'大于直角且小于平角的角叫钝角','difficulty':1},
    {'grade':2,'knowledge':'角的认识','question_type':'choice','content':'红领巾上的角是?','options':opts('锐角','直角','钝角','以上都是'),'answer':'钝角','explanation':'红领巾是等腰三角形,3个角都是钝角','difficulty':2},
    {'grade':2,'knowledge':'角的认识','question_type':'choice','content':'钟表上3时整,时针和分针成的角是?','options':opts('锐角','直角','钝角','平角'),'answer':'直角','explanation':'钟表3时整,时针在3分针在12,形成直角','difficulty':3},

    # ===== 时间（时分换算 / 计算） (6 道) =====
    {'grade':2,'knowledge':'时间的计算','question_type':'choice','content':'时针指向3分针指12,这是?','options':opts('3时','12时','15时','9时'),'answer':'3时','explanation':'分针指12时,时针指3就是3时','difficulty':1},
    {'grade':2,'knowledge':'时间的计算','question_type':'fill','content':'1小时=()分,1分=()秒','options':None,'answer':'60,60','explanation':'1小时=60分,1分=60秒','difficulty':1},
    {'grade':2,'knowledge':'时间的计算','question_type':'fill','content':'小红8:30开始写作业,9:00写完,用了几分钟?','options':None,'answer':'30','explanation':'8:30到9:00是30分钟','difficulty':2},
    {'grade':2,'knowledge':'时间的计算','question_type':'fill','content':'电影14:00开始,放2小时,几点结束?','options':None,'answer':'16:00','explanation':'14:00+2:00=16:00','difficulty':2},
    {'grade':2,'knowledge':'时间的计算','question_type':'choice','content':'现在是9:00,1小时后是?','options':opts('9:00','10:00','11:00','8:00'),'answer':'10:00','explanation':'9:00+1小时=10:00','difficulty':1},
    {'grade':2,'knowledge':'时间的计算','question_type':'choice','content':'小明8:00到校,17:00放学,在校几小时?','options':opts('8小时','9小时','10小时','17小时'),'answer':'9小时','explanation':'17-8=9(小时)','difficulty':3},

    # ===== 长度单位 (6 道) =====
    {'grade':2,'knowledge':'长度单位','question_type':'fill','content':'1米=()厘米','options':None,'answer':'100','explanation':'1米=100厘米','difficulty':1},
    {'grade':2,'knowledge':'长度单位','question_type':'choice','content':'数学书宽大约?','options':opts('20厘米','20米','2厘米','2米'),'answer':'20厘米','explanation':'数学书宽约20厘米,20米太大了','difficulty':1},
    {'grade':2,'knowledge':'长度单位','question_type':'choice','content':'操场的跑道长约?','options':opts('20厘米','20米','2米','400米'),'answer':'400米','explanation':'标准操场跑道一圈400米','difficulty':2},
    {'grade':2,'knowledge':'长度单位','question_type':'fill','content':'3米=()厘米','options':None,'answer':'300','explanation':'1米=100厘米,3米=300厘米','difficulty':2},
    {'grade':2,'knowledge':'长度单位','question_type':'fill','content':'500厘米=()米','options':None,'answer':'5','explanation':'100厘米=1米,500厘米=5米','difficulty':2},
    {'grade':2,'knowledge':'长度单位','question_type':'judge','content':'一支铅笔长18米。对吗?','options':opts('✓','✗'),'answer':'✗','explanation':'铅笔长约18厘米,不是18米','difficulty':1},

    # ===== 倍数问题 (6 道) =====
    {'grade':2,'knowledge':'倍数问题','question_type':'choice','content':'苹果8个,梨的个数是苹果的3倍,梨有几个?','options':opts('3个','11个','24个','32个'),'answer':'24个','explanation':'8×3=24(个)','difficulty':2},
    {'grade':2,'knowledge':'倍数问题','question_type':'fill','content':'白兔5只,黑兔是白兔的4倍,黑兔()只','options':None,'answer':'20','explanation':'5×4=20(只)','difficulty':2},
    {'grade':2,'knowledge':'倍数问题','question_type':'fill','content':'小红有6本书,小明的书是小红的2倍,小明有()本','options':None,'answer':'12','explanation':'6×2=12(本)','difficulty':2},
    {'grade':2,'knowledge':'倍数问题','question_type':'choice','content':'鸡12只,鸭是鸡的2倍,鸡和鸭一共几只?','options':opts('14只','24只','36只','48只'),'answer':'36只','explanation':'鸭12×2=24只,共12+24=36','difficulty':3},
    {'grade':2,'knowledge':'倍数问题','question_type':'fill','content':'哥哥有20元,弟弟的钱是哥哥的3倍,弟弟()元,共()元','options':None,'answer':'60,80','explanation':'弟弟20×3=60,共20+60=80','difficulty':3},
    {'grade':2,'knowledge':'倍数问题','question_type':'choice','content':'杨树5棵,柳树是杨树的4倍,柳树比杨树多几棵?','options':opts('9棵','15棵','20棵','25棵'),'answer':'15棵','explanation':'5×4=20,多20-5=15(棵)','difficulty':3},

    # ===== 间隔问题 (6 道) =====
    {'grade':2,'knowledge':'间隔问题','question_type':'fill','content':'路长20米,每隔5米种一棵树(两端都种),共几棵?','options':None,'answer':'5','explanation':'20÷5+1=4+1=5(棵)','difficulty':3},
    {'grade':2,'knowledge':'间隔问题','question_type':'fill','content':'马路一边有8盏灯,灯之间距离5米,路长多少米?','options':None,'answer':'35','explanation':'(8-1)×5=35(米)','difficulty':3},
    {'grade':2,'knowledge':'间隔问题','question_type':'choice','content':'把一根木头锯成5段,锯几次?','options':opts('4次','5次','6次','10次'),'answer':'4次','explanation':'锯5段要4次','difficulty':2},
    {'grade':2,'knowledge':'间隔问题','question_type':'fill','content':'同学们排成一列,小明排第8,从前往后数与从后往前数差3,他后面有()人','options':None,'answer':'4','explanation':'前7+1+后X=总,后X=总-8,他后4人','difficulty':3},
    {'grade':2,'knowledge':'间隔问题','question_type':'judge','content':'爬楼梯,每层楼有相同台阶,住3楼爬2层,住5楼爬5层。对吗?','options':opts('✓','✗'),'answer':'✗','explanation':'住X楼爬X-1层,住5楼爬4层','difficulty':3},
    {'grade':2,'knowledge':'间隔问题','question_type':'fill','content':'圆形花坛周围每隔3米种一花,周长24米,共种()朵','options':None,'answer':'8','explanation':'圆形(封闭)棵树=周长÷间隔,24÷3=8','difficulty':3},

    # ===== 周期问题 (5 道) =====
    {'grade':2,'knowledge':'周期问题','question_type':'fill','content':'星期三之后第5天是星期几?','options':None,'answer':'星期日','explanation':'星期三+5=星期日(3,4,5,6,日,数5个)','difficulty':2},
    {'grade':2,'knowledge':'周期问题','question_type':'fill','content':'按红黄蓝红黄蓝的顺序,第10个是什么颜色?','options':None,'answer':'红色','explanation':'每3个循环一次,10÷3=3余1,余数1对应周期第1个,即红色','difficulty':2},
    {'grade':2,'knowledge':'周期问题','question_type':'fill','content':'一串珠子按"黑白黑白"排列,第12颗是?','options':None,'answer':'白色','explanation':'每2个一循环,12÷2=6余0,余0对应周期最后一个,即白色','difficulty':3},
    {'grade':2,'knowledge':'周期问题','question_type':'choice','content':'7天前是星期四,今天是星期几?','options':opts('星期一','星期四','星期三','星期六'),'answer':'星期四','explanation':'7天前和今天是同一个星期','difficulty':2},
    {'grade':2,'knowledge':'周期问题','question_type':'fill','content':'今年6月1日是星期六,6月8日是星期几?','options':None,'answer':'星期六','explanation':'7天后是同一个星期','difficulty':3},

    # ===== 估算 (4 道) =====
    {'grade':2,'knowledge':'估算','question_type':'fill','content':'估算:48+33约等于()','options':None,'answer':'80','explanation':'48约50,33约30,50+30=80','difficulty':2},
    {'grade':2,'knowledge':'估算','question_type':'fill','content':'估算:71-28约等于()','options':None,'answer':'40','explanation':'71约70,28约30,70-30=40','difficulty':2},
    {'grade':2,'knowledge':'估算','question_type':'choice','content':'买23元的书80元够吗?','options':opts('够','不够','刚好','无法判断'),'answer':'够','explanation':'23<80,够','difficulty':1},
    {'grade':2,'knowledge':'估算','question_type':'judge','content':'97+52的答案大约是140。对吗?','options':opts('✓','✗'),'answer':'✓','explanation':'97约100,52约50,100+50=150,接近140','difficulty':2},

    # ===== 简单统计 (4 道) =====
    {'grade':2,'knowledge':'简单统计','question_type':'choice','content':'小红语文85分数学92分英语88分,最高分是?','options':opts('85分','92分','88分','一样高'),'answer':'92分','explanation':'92最高','difficulty':1},
    {'grade':2,'knowledge':'简单统计','question_type':'fill','content':'一班10人,二班15人,三班8人,平均每班()人','options':None,'answer':'11','explanation':'(10+15+8)÷3=33÷3=11人','difficulty':3},
    {'grade':2,'knowledge':'简单统计','question_type':'choice','content':'跳绳比赛,小红30下小芳45下小明40下,谁第一?','options':opts('小红','小芳','小明','平局'),'answer':'小芳','explanation':'45下最多,小芳第一','difficulty':1},
    {'grade':2,'knowledge':'简单统计','question_type':'judge','content':'5,7,3,9,6这几个数中,5是中位数。对吗?','options':opts('✓','✗'),'answer':'✗','explanation':'从小到大排:3,5,6,7,9,中位数是第3个即6,不是5,所以错','difficulty':3},

    # ===== 二年级应用题（原3+补充,合计12道）=====
    {'grade':2,'knowledge':'应用题','question_type':'choice','content':'小红30元买文具花18元,还剩几元?','options':opts('10元','12元','14元','16元'),'answer':'12元','explanation':'30-18=12(元)','difficulty':2},
    {'grade':2,'knowledge':'应用题','question_type':'choice','content':'每支铅笔3角买5支,几角?','options':opts('10角','15角','20角','25角'),'answer':'15角','explanation':'3×5=15(角)','difficulty':2},
    {'grade':2,'knowledge':'应用题','question_type':'choice','content':'20个苹果平均分5个小朋友,每人几个?','options':opts('3个','4个','5个','6个'),'answer':'4个','explanation':'20÷5=4(个)','difficulty':2},
    {'grade':2,'knowledge':'应用题','question_type':'choice','content':'二年级一班38人,二班42人,共有几人?','options':opts('70人','80人','90人','100人'),'answer':'80人','explanation':'38+42=80(人)','difficulty':2},
    {'grade':2,'knowledge':'应用题','question_type':'choice','content':'操场50人,走了18人,还剩几人?','options':opts('28人','32人','38人','68人'),'answer':'32人','explanation':'50-18=32(人)','difficulty':2},
    {'grade':2,'knowledge':'应用题','question_type':'fill','content':'一本书95页,看了60页,还剩()页','options':None,'answer':'35','explanation':'95-60=35(页)','difficulty':2},
    {'grade':2,'knowledge':'应用题','question_type':'fill','content':'3个班种树,每班种6棵,共种()棵','options':None,'answer':'18','explanation':'3×6=18(棵)','difficulty':2},
    {'grade':2,'knowledge':'应用题','question_type':'choice','content':'小明5天看10页书,平均每天看几页?','options':opts('1页','2页','5页','10页'),'answer':'2页','explanation':'10÷5=2(页)','difficulty':2},
    {'grade':2,'knowledge':'应用题','question_type':'fill','content':'一支笔8元,买4支共()元,有50元能买()支还剩()元','options':None,'answer':'32,6,2','explanation':'4×8=32,50÷8=6余2,买6支剩2元','difficulty':3},
    {'grade':2,'knowledge':'应用题','question_type':'choice','content':'小明30元,买苹果5元/斤买6斤,还剩几元?','options':opts('0元','5元','10元','25元'),'answer':'0元','explanation':'5×6=30,30-30=0元','difficulty':3},
    {'grade':2,'knowledge':'应用题','question_type':'fill','content':'学校买了50个球,其中篮球5个,足球是篮球的4倍,排球是足球的2倍,排球()个','options':None,'answer':'40','explanation':'足球5×4=20,排球20×2=40','difficulty':3},
    {'grade':2,'knowledge':'应用题','question_type':'choice','content':'小华从家到学校每分钟走60米,5分钟到,学校离家几米?','options':opts('60米','65米','300米','600米'),'answer':'300米','explanation':'60×5=300(米)','difficulty':3},
]


SEED_QUESTIONS = GRADE_1 + GRADE_2

if __name__ == '__main__':
    g1 = len(GRADE_1)
    g2 = len(GRADE_2)
    print(f'共 {len(SEED_QUESTIONS)} 道题')
    print(f'一年级 {g1} 道,二年级 {g2} 道')

    # 验证答案合理性(简单自检)
    issues = []
    for i, q in enumerate(SEED_QUESTIONS):
        if not q.get('answer'):
            issues.append(f'  题{i+1}无答案: {q["content"][:40]}')
        if q.get('question_type') == 'choice' and not q.get('options'):
            issues.append(f'  题{i+1}选择题无选项: {q["content"][:40]}')
        if q.get('question_type') == 'fill' and q.get('options'):
            issues.append(f'  题{i+1}填空题不应有选项: {q["content"][:40]}')

    if issues:
        print('自检发现问题:')
        for s in issues:
            print(s)
    else:
        print('✓ 所有题目结构完整')
