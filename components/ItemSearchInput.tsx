"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import * as api from "@/lib/api";

interface ItemSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectTemplate?: (template: TemplateItem) => void;
  placeholder?: string;
  required?: boolean;
}

interface TemplateItem {
  id?: number;
  name: string;
  market_hash_name?: string;
  icon_url?: string;
  weapon?: string;
  exterior?: string;
}

export default function ItemSearchInput({
  value,
  onChange,
  onSelectTemplate,
  placeholder = "输入饰品名称搜索...",
  required = false,
}: ItemSearchInputProps) {
  const [suggestions, setSuggestions] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 防抖搜索
  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 设置新的定时器
    debounceTimerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await api.searchTemplates(value);
        setSuggestions(result.templates || []);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("搜索失败:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms 防抖

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectTemplate(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const handleSelectTemplate = (template: TemplateItem) => {
    const displayName =
      template.name || template.market_hash_name || `模板 ${template.id}`;
    onChange(displayName);
    setShowSuggestions(false);
    if (onSelectTemplate) {
      // 如果候选项中包含内部 template id (>0)，则请求详情并回传完整对象
      if (template.id && template.id > 0) {
        (async () => {
          const tid = template.id as number;
          try {
            setLoading(true);
            const full = await api.getTemplate(tid);
            const fullAny = full as Record<string, any>;
            const merged = {
              ...fullAny,
              id: template.id,
              name: fullAny.name ?? template.name,
              market_hash_name:
                fullAny.market_hash_name ?? template.market_hash_name,
              icon_url: fullAny.icon_url ?? template.icon_url,
              weapon: fullAny.weapon ?? template.weapon,
              exterior: fullAny.exterior ?? template.exterior,
              quality: fullAny.quality,
              rarity: fullAny.rarity,
            } as TemplateItem & Record<string, any>;
            onSelectTemplate(merged as TemplateItem);
          } catch (err) {
            console.error("获取模板详情失败:", err);
            onSelectTemplate(template);
          } finally {
            setLoading(false);
          }
        })();
      } else {
        // 外部 autocomplete 未映射到内部模板 id，直接回传基础数据
        onSelectTemplate(template);
      }
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          required={required}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* 搜索建议下拉框 */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((template, index) => {
            const displayName =
              template.name ||
              template.market_hash_name ||
              `模板 ${template.id}`;
            const displaySubtitle = [template.weapon, template.exterior]
              .filter(Boolean)
              .join(" | ");

            return (
              <div
                key={`${template.id}-${index}`}
                onClick={() => handleSelectTemplate(template)}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? "bg-blue-50 border-l-2 border-blue-500"
                    : "hover:bg-gray-50"
                } ${index !== 0 ? "border-t border-gray-100" : ""}`}
              >
                {template.icon_url && (
                  <img
                    src={template.icon_url}
                    alt={displayName}
                    className="w-12 h-12 object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {displayName}
                  </div>
                  {displaySubtitle && (
                    <div className="text-xs text-gray-500 truncate">
                      {displaySubtitle}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 无结果提示 */}
      {showSuggestions &&
        !loading &&
        value.length >= 2 &&
        suggestions.length === 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500"
          >
            未找到匹配的饰品
          </div>
        )}
    </div>
  );
}
