import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useState,
} from 'react';
import { renderToString } from 'react-dom/server';
import * as S from './style';
import TECH_STACK_DATA from '@/shared/constants/techStackData';
import UploadItem from '../common/UploadItem';
import { useRecoilState } from 'recoil';
import { projectItems } from '@/recoil/states';
import useToast from '@/shared/hooks/useToast';

interface InputProps extends React.HTMLProps<HTMLInputElement> {}

const TechStackInput = ({ type, placeholder }: InputProps) => {
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [matchList, setMatchList] = useState<string[]>([]);
  const [uploadList, setUploadList] = useState<string[]>([]);
  const [markdown, setMarkdown] = useRecoilState(projectItems);
  const toast = useToast();

  const handleAreaClick = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    document.addEventListener('click', handleAreaClick);

    return () => document.removeEventListener('click', handleAreaClick);
  }, []);

  const handleInputValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setValue(value);
    setIsOpen(true);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      if (Object.keys(TECH_STACK_DATA).includes(value.toLowerCase())) {
        addMarkdown(value.toLowerCase());
        setUploadList((prevList: string[]) => [
          ...prevList,
          value.toLowerCase(),
        ]);
        setIsOpen(false);
        setValue('');
        return;
      }
      toast({
        message: '존재하지 않는 기술스택입니다!',
        status: 'error',
      });
    }
  };

  const handleUploadItemDelete = (index: number, text: string) => {
    const newMarkdown = markdown.map((item) => {
      if (item.name === 'techStack' && item.detail) {
        const newData = item.detail.replace(text, '');
        return { ...item, detail: newData };
      }
      return item;
    });
    setMarkdown(newMarkdown);
    const newUploadItem = uploadList.filter((_, i) => i !== index);
    setUploadList(newUploadItem);
  };

  const addMarkdown = (target: string) => {
    const newMarkdown = markdown.map((item) => {
      if (item.name === 'techStack') {
        return {
          ...item,
          detail: item.detail + renderToString(TECH_STACK_DATA[target]),
        };
      }
      return item;
    });
    setMarkdown(newMarkdown);
  };

  // 연관 데이터 클릭
  const handleMatchItemClick = (e: MouseEvent) => {
    const { textContent } = e.target as HTMLLIElement;
    if (textContent) {
      addMarkdown(textContent);
      setUploadList((prevList: string[]) => [...prevList, textContent!]);
      setIsOpen(false);
      setValue('');
    }
  };

  // 연관 데이터 필터
  useEffect(() => {
    const matchDataList = value
      ? Object.keys(TECH_STACK_DATA).filter((target) =>
          target.startsWith(value.toLowerCase()),
        )
      : [];
    setMatchList(matchDataList.slice(0, 4));
  }, [value]);

  return (
    <>
      <S.Wrap>
        <S.ReletiveBox>
          <S.Input
            value={value}
            onChange={handleInputValue}
            type={type}
            placeholder={placeholder}
            onKeyUp={handleKeyPress}
          />
          {isOpen && (
            <S.MatchList>
              {matchList?.map((list, idx) => (
                <S.MatchItem key={idx} onClick={handleMatchItemClick}>
                  {list}
                </S.MatchItem>
              ))}
            </S.MatchList>
          )}
        </S.ReletiveBox>
      </S.Wrap>
      <S.BottomWrapper>
        {markdown.map((item) => {
          if (item.name === 'techStack' && item.detail) {
            const slice = item.detail.split('/>');
            slice.pop();
            return slice?.map((list, idx) => {
              const element = list + '/>';
              const match = element.match(/logo=([^&]+)/);
              if (match) {
                return (
                  <UploadItem
                    onClick={() => handleUploadItemDelete(idx, element)}
                    key={idx}
                    text={match[1]}
                  />
                );
              }
            });
          }
        })}
      </S.BottomWrapper>
    </>
  );
};

export default TechStackInput;
