import { useEffect, useState } from 'react';
import * as S from './style';
import UploadItem from '../common/UploadItem';
import Button from '../common/Button';
import { useRecoilState } from 'recoil';
import { projectItems } from '@/recoil/states';

interface TeamMemberInfo {
  githubUserInfo: string[];
  role: string;
}

const TeamTableInput = () => {
  const [githubId, setGithubId] = useState('');
  const [role, setRole] = useState('');
  const [teamMemberInfoList, setTeamMemberInfoList] = useState<
    TeamMemberInfo[]
  >([]);
  const [teamMemberList, setTeamMemberList] = useState<string[]>([]); // upload된 팀원
  const [teamTableMarkdown, setTeamTableMarkdown] = useState<string>('');

  const [markdown, setMarkdown] = useRecoilState(projectItems);

  /** sessionStorage에 이미 존재하는 경우 setting */
  useEffect(() => {
    markdown.map((item) => {
      if (item.name === 'teamTable' && item.teamMembers) {
        return setTeamMemberList(item.teamMembers);
      }
    });
  }, [markdown]);

  useEffect(() => {
    console.log(teamMemberInfoList);
    if (teamMemberInfoList.length === 0) return setTeamTableMarkdown('');
    const newMarkdown = markdown.map((item) => {
      if (item.name === 'teamTable' && item.teamMembers) {
        const newMembers = teamMemberInfoList.map((member) => {
          return `${member.githubUserInfo[1]} | ${member.role}`;
        });
        return {
          ...item,
          detail: `### ${item.type}` + '\n' + teamTableMarkdown,
          teamMembers: newMembers,
        };
      }
      return item;
    });

    console.log(newMarkdown);
    setMarkdown(newMarkdown);

    setGithubId('');
    setRole('');
  }, [teamTableMarkdown]);

  useEffect(() => {
    console.log(teamMemberInfoList.length);
    const markDownImage = teamMemberInfoList
      .map(
        (member) =>
          `|<img src="${member.githubUserInfo[0]}" width="150" height="150"/>`,
      )
      .join('');

    const markDownUserInfo = teamMemberInfoList
      .map(
        (member) =>
          `|${member.role}: ${member.githubUserInfo[2]}<br/>[@${member.githubUserInfo[1]}](${member.githubUserInfo[3]})`,
      )
      .join('');

    const table = '|:-:'.repeat(teamMemberInfoList.length);

    console.log(markDownImage + '\n' + table + '\n' + markDownUserInfo);

    setTeamTableMarkdown(
      markDownImage + '\n' + table + '\n' + markDownUserInfo,
    );
  }, [teamMemberInfoList]);

  /** github user 정보 불러오기 */
  const getUsers = async (props: string): Promise<string[] | undefined> => {
    try {
      const response = await fetch(`https://api.github.com/users/${props}`);
      if (response.status === 200) {
        const data = await response.json();
        return [data.avatar_url, data.login, data.name, data.html_url];
      } else {
        console.error('Failed to fetch user data:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  /** 추가 */
  const handleTeamMemberCreate = async () => {
    if (!githubId || !role) return alert('Github ID와 직무를 입력해주세요.');

    const githubUserInfo = await getUsers(githubId);
    if (githubUserInfo) {
      const newMember: TeamMemberInfo = {
        githubUserInfo,
        role,
      };

      setTeamMemberInfoList([...teamMemberInfoList, newMember]);
    }
  };

  /** 삭제 */
  const handleTeamMemberDelete = (index: number) => {
    return () => {
      const newTeamMemberList = teamMemberList.filter((_, i) => i !== index);
      console.log(newTeamMemberList);
      setTeamMemberList(newTeamMemberList);

      const newTeamMemberInfoList = teamMemberInfoList.filter(
        (_, i) => i !== index,
      );
      console.log(newTeamMemberInfoList);
      setTeamMemberInfoList(newTeamMemberInfoList);
    };
  };

  return (
    <>
      <S.RelativeBox>
        <S.Input
          type="text"
          value={githubId}
          onChange={(e) => setGithubId(e.target.value)}
          placeholder={'팀원의 Github ID를 입력하세요.'}
        />
        <S.Input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="팀원의 직무를 입력하세요."
        />
        <Button onClick={handleTeamMemberCreate}>추가</Button>
      </S.RelativeBox>
      {teamMemberList.length > 0 && (
        <S.BottomWrapper>
          {teamMemberList.map((member, index) => {
            return (
              <UploadItem
                key={index}
                text={member}
                onClick={handleTeamMemberDelete(index)}
              />
            );
          })}
        </S.BottomWrapper>
      )}
    </>
  );
};

export default TeamTableInput;
