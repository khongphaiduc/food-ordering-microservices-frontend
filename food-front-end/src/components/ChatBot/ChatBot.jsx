import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  RefreshCw,
  Maximize2,
  Minimize2,
  Bot,
  User,
  ShoppingBag,
  Sparkles,
  Gift,
  Clock,
  HelpCircle,
  Plus
} from "lucide-react";
import Swal from "sweetalert2";
import "./ChatBot.css";

// Sample mock food recommendation data for interactive food cards inside ChatBot
const SAMPLE_FOODS = [
  {
    id: 1,
    name: "Pizza Bò Mỹ Phô Mai Thượng Hạng",
    price: "189.000đ",
    rawPrice: 189000,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80",
    rating: 4.9
  },
  {
    id: 2,
    name: "Combo Gà Rán Giòn Rụm + Pepsi",
    price: "99.000đ",
    rawPrice: 99000,
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=80",
    rating: 4.8
  },
  {
    id: 3,
    name: "Trà Sữa Trân Châu Hoàng Gia",
    price: "35.000đ",
    rawPrice: 35000,
    image: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&auto=format&fit=crop&q=80",
    rating: 4.7
  }
];

const INITIAL_MESSAGES = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "Xin chào quý khách! 👋 Tôi là **Foodly** - Trợ lý thông minh sẵn sàng hỗ trợ bạn chọn món ngon, tìm mã giảm giá và kiểm tra đơn hàng 24/7.",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      "🍕 Gợi ý món bán chạy",
      "🎁 Mã giảm giá hôm nay",
      "📦 Tra cứu đơn hàng",
      "🕒 Giờ mở cửa & Phí giao hàng"
    ]
  }
];

const PROACTIVE_GREETINGS = [
  "Tui có thể giúp bạn gì không? 🍕",
  "Bạn đang thèm món gì hôm nay? 😋",
  "Foodly có nhiều mã giảm giá hot nè! 🎁",
  "Cần tìm món ngon hay tra đơn cứ bấm tui nhé! 🤖✨",
  "Hôm nay bạn muốn ăn gì nhỉ? 🍔🥤"
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("foodly_chatbot_messages");
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tooltipMessage, setTooltipMessage] = useState(null);

  const messagesEndRef = useRef(null);

  // Proactive greeting bubble timer when chat is closed
  useEffect(() => {
    if (isOpen) {
      setTooltipMessage(null);
      return;
    }

    const showGreeting = () => {
      const randomIndex = Math.floor(Math.random() * PROACTIVE_GREETINGS.length);
      setTooltipMessage(PROACTIVE_GREETINGS[randomIndex]);

      setTimeout(() => {
        setTooltipMessage(null);
      }, 7000);
    };

    // First greeting 3.5 seconds after page load/close
    const initialTimer = setTimeout(showGreeting, 3500);

    // Periodic greetings every 20 seconds
    const intervalTimer = setInterval(showGreeting, 20000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [isOpen]);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen, isTyping]);

  // Save to local storage on message change
  useEffect(() => {
    localStorage.setItem("foodly_chatbot_messages", JSON.stringify(messages));
  }, [messages]);

  // Handle open/close
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  // Clear chat history
  const handleClearChat = () => {
    Swal.fire({
      title: "Xóa lịch sử trò chuyện?",
      text: "Bạn có chắc muốn bắt đầu lại cuộc trò chuyện mới?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff4757",
      cancelButtonColor: "#718096",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy"
    }).then((result) => {
      if (result.isConfirmed) {
        setMessages(INITIAL_MESSAGES);
        localStorage.removeItem("foodly_chatbot_messages");
      }
    });
  };

  // Add Item to Cart from Chatbot Card
  const handleAddToCartFromBot = (food) => {
    // Read current cart from localStorage if exists
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = currentCart.findIndex((item) => item.id === food.id);

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += 1;
    } else {
      currentCart.push({
        id: food.id,
        name: food.name,
        price: food.rawPrice,
        image: food.image,
        quantity: 1
      });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));

    // Trigger storage event so cart drawer updates
    window.dispatchEvent(new Event("storage"));

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `Đã thêm ${food.name} vào giỏ hàng! 🛒`,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  };

  // Simulated AI response engine
  const generateBotResponse = (userText) => {
    const text = userText.toLowerCase();
    let responseObj = {
      text: "",
      foods: null,
      suggestions: null
    };

    if (text.includes("món") || text.includes("gợi ý") || text.includes("bán chạy") || text.includes("ăn gì") || text.includes("hot")) {
      responseObj.text = "Dưới đây là **Top 3 Món Ngon Bán Chạy Nhất** hôm nay được nhiều khách hàng yêu thích! Bạn có thể thêm trực tiếp vào giỏ hàng ngay tại đây nhé 😋:";
      responseObj.foods = SAMPLE_FOODS;
      responseObj.suggestions = ["🎁 Mã giảm giá hôm nay", "📦 Tra cứu đơn hàng"];
    } else if (text.includes("giảm giá") || text.includes("khuyến mãi") || text.includes("voucher") || text.includes("code")) {
      responseObj.text = "🎉 **Chương Trình Khuyến Mãi Đang Áp Dụng:**\n\n- 🎟 **FOODIE50**: Giảm 50.000đ cho đơn hàng từ 200.000đ\n- 🚀 **FREESHIP**: Miễn phí vận chuyển cho đơn hàng từ 150.000đ trong bán kính 5km.\n\nNhập mã ở bước thanh toán để nhận ưu đãi ngay bạn nhé!";
      responseObj.suggestions = ["🍕 Gợi ý món bán chạy", "🛒 Đặt hàng ngay"];
    } else if (text.includes("đơn hàng") || text.includes("tra cứu") || text.includes("kiểm tra") || text.includes("vận chuyển")) {
      responseObj.text = "📦 Để tra cứu chi tiết tiến độ đơn hàng của bạn, bạn hãy truy cập mục **Lịch sử đơn hàng** trên thanh điều hướng hoặc nhập Mã Đơn Hàng vào đây để trợ lý tra cứu giúp bạn nhé!";
      responseObj.suggestions = ["🍕 Gợi ý món bán chạy", "📞 Hỗ trợ trực tiếp"];
    } else if (text.includes("giờ") || text.includes("mở cửa") || text.includes("phí") || text.includes("ship")) {
      responseObj.text = "🕒 **Thông tin phục vụ:**\n- Giờ mở cửa: **07:00 - 22:30** tất cả các ngày trong tuần.\n- Phí giao hàng: Đồng giá **15.000đ** dưới 3km. Freeship cho đơn trên 150K.";
      responseObj.suggestions = ["🍕 Gợi ý món bán chạy", "🎁 Mã giảm giá"];
    } else if (text.includes("xin chào") || text.includes("hi") || text.includes("hello") || text.includes("chào")) {
      responseObj.text = "Chào bạn! Rất vui được đồng hành cùng bạn hôm nay. Bạn đang thèm món gì hay cần Foodly hỗ trợ thông tin gì nào? 🍔🥤";
      responseObj.suggestions = ["🍕 Gợi ý món bán chạy", "🎁 Mã giảm giá hôm nay"];
    } else {
      responseObj.text = `Cảm ơn bạn đã nhắn tin! Foodly đã ghi nhận câu hỏi: "${userText}".\n\nHệ thống đang kết nối dữ liệu món ăn tốt nhất cho bạn. Bạn có muốn xem danh sách gợi ý đặc biệt hôm nay không?`;
      responseObj.foods = [SAMPLE_FOODS[0], SAMPLE_FOODS[1]];
      responseObj.suggestions = ["🍕 Gợi ý món bán chạy", "🎁 Mã giảm giá hôm nay"];
    }

    return responseObj;
  };

  // Handle sending a message
  const handleSendMessage = (textToSend = null) => {
    const content = textToSend || inputMessage;
    if (!content.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const botResponse = generateBotResponse(content);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botResponse.text,
        foods: botResponse.foods,
        suggestions: botResponse.suggestions,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="chatbot-launcher-wrapper">
          {tooltipMessage && (
            <div
              className="chatbot-proactive-bubble"
              onClick={() => {
                setIsOpen(true);
                setTooltipMessage(null);
              }}
            >
              <span>{tooltipMessage}</span>
              <button
                className="chatbot-bubble-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setTooltipMessage(null);
                }}
                title="Đóng thông báo"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <button
            className="chatbot-launcher"
            onClick={toggleChat}
            title="Trò chuyện với Trợ lý Foodly"
          >
            <img
              src="/chatbot-avatar.png"
              alt="Foodly Assistant"
              className="chatbot-launcher-img"
            />
            {unreadCount > 0 && <span className="chatbot-badge">{unreadCount}</span>}
          </button>
        </div>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <div className={`chatbot-container ${isExpanded ? "expanded" : ""}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar-wrapper">
                <img
                  src="/chatbot-avatar.png"
                  alt="Foodly"
                  className="chatbot-avatar-img"
                />
                <span className="chatbot-status-dot"></span>
              </div>
              <div className="chatbot-title-box">
                <h4 className="chatbot-title">Foodly Assistant</h4>
                <span className="chatbot-subtitle">
                  <Sparkles size={12} /> Trợ lý thông minh 24/7
                </span>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button
                type="button"
                className="chatbot-icon-btn"
                onClick={handleClearChat}
                title="Làm mới cuộc trò chuyện"
                aria-label="Làm mới cuộc trò chuyện"
              >
                <RefreshCw size={15} color="#ffffff" strokeWidth={2.2} />
              </button>
              <button
                type="button"
                className="chatbot-icon-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Thu nhỏ" : "Phóng to"}
                aria-label={isExpanded ? "Thu nhỏ" : "Phóng to"}
              >
                {isExpanded ? (
                  <Minimize2 size={15} color="#ffffff" strokeWidth={2.2} />
                ) : (
                  <Maximize2 size={15} color="#ffffff" strokeWidth={2.2} />
                )}
              </button>
              <button
                type="button"
                className="chatbot-icon-btn"
                onClick={toggleChat}
                title="Đóng cửa sổ chat"
                aria-label="Đóng cửa sổ chat"
              >
                <X size={18} color="#ffffff" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="chatbot-body">
            <div className="chatbot-date-divider">Hôm nay</div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-message ${msg.sender === "bot" ? "bot" : "user"}`}
              >
                <div className="chatbot-msg-avatar">
                  {msg.sender === "bot" ? (
                    <img
                      src="/chatbot-avatar.png"
                      alt="Bot"
                      className="chatbot-msg-avatar-img"
                    />
                  ) : (
                    <User size={16} />
                  )}
                </div>

                <div className="chatbot-msg-bubble-wrapper">
                  <div className="chatbot-msg-bubble">
                    <p style={{ whiteSpace: "pre-line", margin: 0 }}>
                      {msg.text.split("**").map((part, idx) =>
                        idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                      )}
                    </p>

                    {/* Interactive Food Cards inside Chatbot */}
                    {msg.foods && (
                      <div className="chatbot-food-cards">
                        {msg.foods.map((food) => (
                          <div key={food.id} className="chatbot-food-card">
                            <img
                              src={food.image}
                              alt={food.name}
                              className="chatbot-food-img"
                            />
                            <div className="chatbot-food-info">
                              <span className="chatbot-food-name">{food.name}</span>
                              <span className="chatbot-food-price">{food.price}</span>
                            </div>
                            <button
                              className="chatbot-food-btn"
                              onClick={() => handleAddToCartFromBot(food)}
                            >
                              <Plus size={14} /> Thêm
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggestion Chips */}
                    {msg.suggestions && (
                      <div className="chatbot-suggestions">
                        {msg.suggestions.map((chip, idx) => (
                          <button
                            key={idx}
                            className="chatbot-chip"
                            onClick={() => handleSendMessage(chip)}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="chatbot-msg-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chatbot-message bot">
                <div className="chatbot-msg-avatar">
                  <img
                    src="/chatbot-avatar.png"
                    alt="Bot"
                    className="chatbot-msg-avatar-img"
                  />
                </div>
                <div className="chatbot-typing">
                  <div className="chatbot-typing-dot"></div>
                  <div className="chatbot-typing-dot"></div>
                  <div className="chatbot-typing-dot"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips Bar */}
          <div className="chatbot-footer">
            <div className="chatbot-quick-bar">
              <button
                className="chatbot-quick-btn"
                onClick={() => handleSendMessage("Gợi ý món ăn hot")}
              >
                🍕 Món HOT
              </button>
              <button
                className="chatbot-quick-btn"
                onClick={() => handleSendMessage("Mã giảm giá hôm nay")}
              >
                🎁 Khuyến mãi
              </button>
              <button
                className="chatbot-quick-btn"
                onClick={() => handleSendMessage("Tra cứu đơn hàng")}
              >
                📦 Kiểm tra đơn
              </button>
              <button
                className="chatbot-quick-btn"
                onClick={() => handleSendMessage("Giờ mở cửa và phí ship")}
              >
                🕒 Giờ phục vụ
              </button>
            </div>

            {/* Input Form */}
            <form
              className="chatbot-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                className="chatbot-input"
                placeholder="Hỏi Foodly bất cứ điều gì..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button
                type="submit"
                className="chatbot-send-btn"
                disabled={!inputMessage.trim() || isTyping}
                title="Gửi tin nhắn"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
