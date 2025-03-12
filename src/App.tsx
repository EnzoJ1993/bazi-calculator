import React, { useState } from 'react';
import { Form, DatePicker, Button, Card, Typography, Row, Col, Divider, Tag, Modal, Spin, Input } from 'antd';
import { Lunar } from 'lunar-typescript';
import './App.css';

const { Title, Text, Paragraph } = Typography;

interface PillarInfo {
  gz: string;
  gan: string;
  zhi: string;
  nayin?: {
    element: WuxingType;
    name: string;
  };
  shishen?: string;
  liuqin?: string;
}

interface BaziResult {
  year: PillarInfo;
  month: PillarInfo;
  day: PillarInfo;
  hour: PillarInfo;
  lunar: {
    year: number;
    month: number;
    day: number;
    yearInChinese: string;
    monthInChinese: string;
    dayInChinese: string;
  };
  shengxiao: string;
  wuxingCount: {
    [key: string]: number;
  };
}

type WuxingType = '木' | '火' | '土' | '金' | '水';

// 五行属性对照表
const wuxing: { [key: string]: WuxingType } = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '子': '水', '亥': '水',
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金'
};

// 纳音五行对照表
const nayin: { [key: string]: { element: WuxingType; name: string } } = {
  '甲子': { element: '水', name: '海中金' },
  '乙丑': { element: '水', name: '海中金' },
  '丙寅': { element: '木', name: '炉中火' },
  '丁卯': { element: '木', name: '炉中火' },
  '戊辰': { element: '土', name: '大林木' },
  '己巳': { element: '土', name: '大林木' },
  '庚午': { element: '火', name: '路旁土' },
  '辛未': { element: '火', name: '路旁土' },
  '壬申': { element: '金', name: '剑锋金' },
  '癸酉': { element: '金', name: '剑锋金' },
  '甲戌': { element: '水', name: '山头火' },
  '乙亥': { element: '水', name: '山头火' },
  '丙子': { element: '木', name: '涧下水' },
  '丁丑': { element: '木', name: '涧下水' },
  '戊寅': { element: '土', name: '城头土' },
  '己卯': { element: '土', name: '城头土' },
  '庚辰': { element: '金', name: '白蜡金' },
  '辛巳': { element: '金', name: '白蜡金' },
  '壬午': { element: '水', name: '杨柳木' },
  '癸未': { element: '水', name: '杨柳木' },
  '甲申': { element: '木', name: '泉中水' },
  '乙酉': { element: '木', name: '泉中水' },
  '丙戌': { element: '火', name: '屋上土' },
  '丁亥': { element: '火', name: '屋上土' },
  '戊子': { element: '土', name: '霹雳火' },
  '己丑': { element: '土', name: '霹雳火' },
  '庚寅': { element: '金', name: '松柏木' },
  '辛卯': { element: '金', name: '松柏木' },
  '壬辰': { element: '水', name: '长流水' },
  '癸巳': { element: '水', name: '长流水' }
};

// 十神对照表
const shishen: { [key: string]: { [key: string]: string } } = {
  '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
  '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
  '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
  '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
  '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
  '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
  '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
  '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
  '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财' },
  '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩' }
};

// 六亲关系对照表
const liuqin: { [key: string]: string } = {
  '比肩': '兄弟',
  '劫财': '兄弟',
  '食神': '子孙',
  '伤官': '子孙',
  '偏财': '妻财',
  '正财': '妻财',
  '七杀': '官鬼',
  '正官': '官鬼',
  '偏印': '父母',
  '正印': '父母'
};

// 五行生克关系
const wuxingRelations: { [key in WuxingType]: { generates: WuxingType; restrains: WuxingType } } = {
  '木': { generates: '火', restrains: '土' },
  '火': { generates: '土', restrains: '金' },
  '土': { generates: '金', restrains: '水' },
  '金': { generates: '水', restrains: '木' },
  '水': { generates: '木', restrains: '火' }
};

// 方位
const directions: { [key in WuxingType]: { favorable: string; unfavorable: string } } = {
  '木': { favorable: '东', unfavorable: '西' },
  '火': { favorable: '南', unfavorable: '北' },
  '土': { favorable: '中', unfavorable: '外' },
  '金': { favorable: '西', unfavorable: '东' },
  '水': { favorable: '北', unfavorable: '南' }
};

// DeepSeek API 配置
const DEEPSEEK_API_KEY = 'sk-08a8bdb853fb49f4b2d7ffbea6e8caad';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

function App() {
  const [form] = Form.useForm();
  const [result, setResult] = useState<BaziResult | null>(null);
  const [deepseekAnalysis, setDeepseekAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [eventText, setEventText] = useState('');
  const [predictionResult, setPredictionResult] = useState('');
  const [isPredictionModalVisible, setIsPredictionModalVisible] = useState(false);

  // 添加格式化预测结果的函数
  const formatPredictionResult = (text: string) => {
    if (!text) return '';
    
    // 分割文本为行
    const lines = text.split('\n');
    
    // 处理每一行
    return lines.map(line => {
      // 清理特殊字符和多余空格
      let cleanLine = line.replace(/[#*`]/g, '').trim();
      
      // 跳过空行
      if (!cleanLine) return null;
      
      // 处理标题行（数字开头的行）
      if (/^\d+\./.test(cleanLine)) {
        return `\n${cleanLine}\n`;
      }
      
      return cleanLine;
    })
    .filter(Boolean) // 移除空行
    .join('\n');
  };

  const analyzeBaziWithDeepseek = async (bazi: BaziResult, event?: string) => {
    setIsAnalyzing(true);
    try {
      let prompt;
      if (event) {
        prompt = `你是一名资深的命理师，你熟读《穷通宝鉴》、《滴天髓》、《渊海子平》等书籍。请根据以下生辰八字和今年的运势等情况，预测所询问重大事件的走向：

生辰八字：
年柱：${bazi.year.gz}（天干：${bazi.year.gan} 地支：${bazi.year.zhi}）
月柱：${bazi.month.gz}（天干：${bazi.month.gan} 地支：${bazi.month.zhi}）
日柱：${bazi.day.gz}（天干：${bazi.day.gan} 地支：${bazi.day.zhi}）
时柱：${bazi.hour.gz}（天干：${bazi.hour.gan} 地支：${bazi.hour.zhi}）

预测事项：${event}

请从以下方面进行分析：
1. 根据《穷通宝鉴》断事之法分析此事吉凶
2. 依据《滴天髓》神煞理论推断事情发展
3. 按照《渊海子平》格局论断结果
4. 结合大运流年给出时间指引
5. 提供趋吉避凶的具体建议`;
      } else {
        prompt = `作为一个专业的命理师，请对以下八字进行详细分析：
        年柱：${bazi.year.gz}（天干：${bazi.year.gan} 地支：${bazi.year.zhi}）
        月柱：${bazi.month.gz}（天干：${bazi.month.gan} 地支：${bazi.month.zhi}）
        日柱：${bazi.day.gz}（天干：${bazi.day.gan} 地支：${bazi.day.zhi}）
        时柱：${bazi.hour.gz}（天干：${bazi.hour.gan} 地支：${bazi.hour.zhi}）
        
        请从以下几个方面进行分析：
        1. 命局特点
        2. 五行分布
        3. 性格特征
        4. 事业发展
        5. 财运分析
        6. 健康提醒
        7. 人际关系
        8. 吉凶方位
        9. 奇门遁甲
           - 请根据生辰八字计算奇门遁甲盘
           - 分析所在宫位的吉凶
           - 解读门、星、神的组合寓意
           - 提供趋吉避凶的建议`;
      }

      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error('API 调用失败');
      }

      const data = await response.json();
      if (event) {
        setPredictionResult(data.choices[0].message.content);
        setIsPredictionModalVisible(true);
      } else {
        setDeepseekAnalysis(data.choices[0].message.content);
      }
    } catch (error) {
      console.error('DeepSeek API 调用错误:', error);
      if (event) {
        setPredictionResult('预测分析过程中出现错误，请稍后重试。');
        setIsPredictionModalVisible(true);
      } else {
        setDeepseekAnalysis('分析过程中出现错误，请稍后重试。');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEventPredict = () => {
    if (result) {
      analyzeBaziWithDeepseek(result, eventText);
    }
    setIsEventModalVisible(false);
    setEventText('');
  };

  const calculateBazi = (values: any) => {
    const datetime = values.datetime;
    if (!datetime) return;

    const lunar = Lunar.fromDate(datetime.toDate());
    const wuxingCount: { [key in WuxingType]: number } = {
      '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
    };

    // 获取日干作为命主
    const dayGan = lunar.getDayGan();

    const bazi: BaziResult = {
      year: {
        gz: lunar.getYearInGanZhi(),
        gan: lunar.getYearGan(),
        zhi: lunar.getYearZhi(),
        nayin: nayin[lunar.getYearInGanZhi()],
        shishen: shishen[dayGan][lunar.getYearGan()],
        liuqin: liuqin[shishen[dayGan][lunar.getYearGan()]]
      },
      month: {
        gz: lunar.getMonthInGanZhi(),
        gan: lunar.getMonthGan(),
        zhi: lunar.getMonthZhi(),
        nayin: nayin[lunar.getMonthInGanZhi()],
        shishen: shishen[dayGan][lunar.getMonthGan()],
        liuqin: liuqin[shishen[dayGan][lunar.getMonthGan()]]
      },
      day: {
        gz: lunar.getDayInGanZhi(),
        gan: lunar.getDayGan(),
        zhi: lunar.getDayZhi(),
        nayin: nayin[lunar.getDayInGanZhi()],
        shishen: '日主',
        liuqin: '自己'
      },
      hour: {
        gz: lunar.getTimeInGanZhi(),
        gan: lunar.getTimeGan(),
        zhi: lunar.getTimeZhi(),
        nayin: nayin[lunar.getTimeInGanZhi()],
        shishen: shishen[dayGan][lunar.getTimeGan()],
        liuqin: liuqin[shishen[dayGan][lunar.getTimeGan()]]
      },
      lunar: {
        year: lunar.getYear(),
        month: lunar.getMonth(),
        day: lunar.getDay(),
        yearInChinese: lunar.getYearInChinese(),
        monthInChinese: lunar.getMonthInChinese(),
        dayInChinese: lunar.getDayInChinese()
      },
      shengxiao: lunar.getYearShengXiao(),
      wuxingCount: wuxingCount
    };

    // 计算五行统计
    ['year', 'month', 'day', 'hour'].forEach(pillar => {
      const p = bazi[pillar as keyof Pick<BaziResult, 'year' | 'month' | 'day' | 'hour'>];
      const ganWuxing = wuxing[p.gan];
      const zhiWuxing = wuxing[p.zhi];
      if (ganWuxing) wuxingCount[ganWuxing]++;
      if (zhiWuxing) wuxingCount[zhiWuxing]++;
    });

    setResult(bazi);
    analyzeBaziWithDeepseek(bazi);
  };

  const getWuxing = (char: string) => {
    return wuxing[char] || '';
  };

  const getWuxingAnalysis = () => {
    if (!result) return null;
    const dayMasterWuxing = getWuxing(result.day.gan);
    const favorableWuxing = wuxingRelations[dayMasterWuxing].generates;
    const unfavorableWuxing = wuxingRelations[dayMasterWuxing].restrains;

    return {
      dominant: dayMasterWuxing,
      weak: unfavorableWuxing,
      favorable: directions[favorableWuxing].favorable,
      unfavorable: directions[unfavorableWuxing].favorable
    };
  };

  // Helper functions for mock analysis
  const getWuxingCharacteristics = (wuxing: WuxingType) => {
    const characteristics = {
      '木': '正直坚韧',
      '火': '热情活泼',
      '土': '稳重踏实',
      '金': '果断坚毅',
      '水': '智慧灵活'
    };
    return characteristics[wuxing];
  };

  const getPersonalityByDayGan = (gan: string): string => {
    const personalities: { [key: string]: string } = {
      '甲': '果断主动，领导力强',
      '乙': '温和细腻，重情重义',
      '丙': '开朗热情，乐观向上',
      '丁': '温暖体贴，善解人意',
      '戊': '稳重踏实，诚实可靠',
      '己': '谦和有礼，心思细腻',
      '庚': '刚毅果断，公正严明',
      '辛': '优雅灵巧，才思敏捷',
      '壬': '智慧聪颖，思维活跃',
      '癸': '机敏灵活，适应力强'
    };
    return personalities[gan] || '性格多元';
  };

  const getCareerAdvice = (wuxing: WuxingType) => {
    const careers = {
      '木': '教育、文化、法律',
      '火': '媒体、娱乐、餐饮',
      '土': '房地产、农业、建筑',
      '金': '金融、珠宝、科技',
      '水': '运输、贸易、传播'
    };
    return careers[wuxing];
  };

  const getHealthAdvice = (wuxing: WuxingType) => {
    const health = {
      '木': '肝胆、筋络',
      '火': '心脏、血液循环',
      '土': '脾胃、消化系统',
      '金': '肺部、呼吸系统',
      '水': '肾脏、泌尿系统'
    };
    return health[wuxing];
  };

  const getRelationshipAdvice = (wuxing: WuxingType) => {
    const advice = {
      '木': '保持包容和理解',
      '火': '控制情绪波动',
      '土': '增加主动性',
      '金': '适当表达感情',
      '水': '建立稳定关系'
    };
    return advice[wuxing];
  };

  return (
    <div className="app">
      <div className="app-container">
        <Title level={2} className="title">生辰八字计算器</Title>
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12}>
            <Card className="result-card">
              <Form
                form={form}
                onFinish={calculateBazi}
                layout="vertical"
              >
                <Form.Item
                  name="datetime"
                  label="出生日期时间"
                  rules={[{ required: true, message: '请选择出生日期时间' }]}
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    placeholder="选择日期和时间"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block size="large">
                    计算八字
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {result && (
              <>
                <Card title="农历日期" className="result-card" style={{ marginTop: 24 }}>
                  <div className="text-center">
                    <Text className="gz-text">
                      农历{result.lunar.yearInChinese}年
                      {result.lunar.monthInChinese}月
                      {result.lunar.dayInChinese}
                    </Text>
                    <Divider type="vertical" />
                    <Text className="gz-text">生肖：{result.shengxiao}</Text>
                  </div>
                </Card>

                <Card title="八字" className="result-card" style={{ marginTop: 24 }}>
                  <Row gutter={[16, 16]}>
                    {(['year', 'month', 'day', 'hour'] as const).map((pillar) => (
                      <Col span={6} key={pillar}>
                        <Card 
                          size="small" 
                          className="pillar-card"
                          title={
                            pillar === 'year' ? '年柱' :
                            pillar === 'month' ? '月柱' :
                            pillar === 'day' ? '日柱' : '时柱'
                          }
                        >
                          <div className="text-center">
                            <Text className="gz-text">{result[pillar].gz}</Text>
                            {result[pillar].nayin && (
                              <div className="info-text">
                                纳音：{result[pillar].nayin.name}
                                <Tag className={`wuxing-tag wuxing-${result[pillar].nayin.element}`}>
                                  {result[pillar].nayin.element}
                                </Tag>
                              </div>
                            )}
                          </div>
                          <Divider style={{ margin: '8px 0' }} />
                          <div className="text-center">
                            <div className="info-text">
                              天干：{result[pillar].gan}
                              <Tag className={`wuxing-tag wuxing-${getWuxing(result[pillar].gan)}`}>
                                {getWuxing(result[pillar].gan)}
                              </Tag>
                            </div>
                            <div className="info-text">
                              十神：{result[pillar].shishen}
                              <Tag color="blue">{result[pillar].liuqin}</Tag>
                            </div>
                          </div>
                          <Divider style={{ margin: '8px 0' }} />
                          <div className="text-center">
                            <div className="info-text">
                              地支：{result[pillar].zhi}
                              <Tag className={`wuxing-tag wuxing-${getWuxing(result[pillar].zhi)}`}>
                                {getWuxing(result[pillar].zhi)}
                              </Tag>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>

                <Card title="DeepSeek 命理分析" className="result-card" style={{ marginTop: 24 }}>
                  <div className="analysis-section">
                    {isAnalyzing ? (
                      <div className="text-center" style={{ padding: '20px' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: '10px' }}>正在进行深度分析...</div>
                      </div>
                    ) : (
                      <div className="deepseek-analysis">
                        {deepseekAnalysis.split('\n').map((line, index) => {
                          // 清理特殊字符
                          const cleanLine = line.replace(/[#*]/g, '').trim();
                          if (!cleanLine) return null;

                          // 判断是否是标题行（数字开头）
                          const isTitle = /^\d+\./.test(cleanLine);
                          
                          if (isTitle) {
                            return (
                              <div key={index} className="analysis-section-title">
                                <Title level={4} className="analysis-subtitle">
                                  {cleanLine}
                                </Title>
                              </div>
                            );
                          } else {
                            return (
                              <div key={index} className="analysis-content">
                                <Paragraph>{cleanLine}</Paragraph>
                              </div>
                            );
                          }
                        }).filter(Boolean)}
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="result-card" style={{ marginTop: 24 }}>
                  <Button 
                    type="primary" 
                    block 
                    onClick={() => setIsEventModalVisible(true)}
                    disabled={isAnalyzing}
                    className="predict-button"
                  >
                    预测重大事件
                  </Button>
                </Card>
              </>
            )}
          </Col>
        </Row>

        <Modal
          title="输入预测事项"
          open={isEventModalVisible}
          onOk={handleEventPredict}
          onCancel={() => setIsEventModalVisible(false)}
          okText="开始预测"
          cancelText="取消"
          className="prediction-input-modal"
          maskClosable={false}
          centered
        >
          <Input.TextArea
            placeholder="请输入需要预测的重大事件（不超过50个字）"
            maxLength={50}
            showCount
            rows={4}
            value={eventText}
            onChange={(e) => setEventText(e.target.value)}
            autoFocus
          />
        </Modal>

        <Modal
          title="重大事件预测结果"
          open={isPredictionModalVisible}
          onCancel={() => setIsPredictionModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsPredictionModalVisible(false)}>
              关闭
            </Button>
          ]}
          width={800}
          maskClosable={false}
          centered
          destroyOnClose
          className="prediction-modal"
        >
          <div className="prediction-result">
            {isAnalyzing ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="large" />
                <p style={{ marginTop: '10px' }}>正在进行预测分析...</p>
              </div>
            ) : (
              <div style={{ whiteSpace: 'pre-line' }}>{formatPredictionResult(predictionResult)}</div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default App; 