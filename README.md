# kwu-op-sw-team7
kwu-opensource-sw-team7

# Project Title
 Match Schedule *수정될 수 있음

## Intro
다수의 시간표에서 겹치지 않는 최적의 시간 찾기
상주 시간표 제작 프로그램
everytime 연동

## Details
설명

## Team / members
| name | student | roles |
|---|----------|------------|
| 이제호 | 2023202076 | design / backend |
| 나민엽 | 2023202015 | planning / design / backend |
| 박민서 | 2023202064 | frontend |
| 정민지 | 2023202053 | frontend |
| 최은준 | 2023202043 | planning / design |

## Schedule

## to do list

### Fetures
* Pick a date from callendar
* Add new task
* Mark task as completed / uncompleted
* Set task priority
* Edit task
* Delete single task
* Delete completed tasks
* Delete all tasks

### Technologies used:
* HTML
* CSS
* JavaScript
* UI
* database

### branch Fetures
- main : 최종본으로 사용할 브랜치
- develop : 다음 버전으로 업데이트할 브랜치
- feature : 기능 구현 브랜치
- ui : 화면 구성 및 디자인 브랜치
- hotfix : 최종 전 버그 수정 브랜치

#### branch struct
 main
    * develop
        * feature
             * feature1 (추가 예정)
             * feature2 (추가 예정)
        * ui
            * page1
            * page2
    * hotfix
       
### git branch rules
- all
  * 개인 작업 항상 각 브랜치에서 하기
  * 항상 작업 전 develop에서 pull 후 각 feature 에서 작업하기
  * merge 하기전에 팀원 2명 이상에게 승인 받기
  * pull Request 할 때, 팀원들에게 공지 후 issue 남기기
    
- main branch
  * main branch는 한 branch가 완성되었을 때 push
  * 모든 팀원이 확인 후 merge / push 할 것
- develop
  * 작업 공간으로 쓸 branch
  * 작업 전 항상 pull 할 것
  * 개인 작업 후 feature branch 에서 pull requset 통해 merge 하기
- feature / ui
  * 각 기능에 맞는 브랜치 생성 예정
  * merge하기 전 팀원 2명에게 승인 받기
  * pull Request할 때 팀원에게 공지
- hotfix
  * 모든 기능과 ui제작 후 테스트 과정에서 쓸 브랜치
  * 초반 개발 단계에서 사용 X
 
### git branch use
- git clone [원격 레포지토리 URL] : 원격 저장소 내용을 로컬 저장소로 가져옴
- git pull : 로컬 저장소가 있을 시 업데이트 내용을 로컬 저장소로 가져옴
- git branch : 현재 branch 상태를 보여줌 / branch list 확 ( * 이 있는 곳이 현재 branch)
- git branch [브랜치명] : 새로운 branch 생성 (초기 세팅 후 사용 안함)
- git branch -d [브랜치명] : 기존 branch 삭제 (잘못 입력 했을 때만 할 것)
- git checkout [브랜치명] : 브랜치 이동 (이동 후 git branch를 통해 현재 위치 확인하기)
- git status : 개인 작업물 상태 확인
- git add . : 변경 내용 모두 추가
- git commit -m "메세지" : 변경내용에 코맨트 남기기
- git push : 원격 저장소의 브랜치 내용 올리기
- git push origin : 원격 저장소에 해당 브랜치가 이미 존재할 때
- git push origin [브랜치명] : 원격 저장소에 해당 브랜치가 없을 때 (초기에만 입력)
- git pull origin [develop] : develop branch 상위 branch(main)에서 실행, 원격 저장소의 develop 변경 사항 pull
- pull requset 한 후 대략적인 수정사항 작성
- reviewers 톱니바퀴 클릭 후 팀원 선택
- create pull request 클릭 후 pull Reuest 요청
- 승인 후 merge pull request / confire merge 클릭
- delete branch는 하지 말 것


## Required technologies
![js](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white)
![html](https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white)
![css](https://img.shields.io/badge/CSS-239120?&style=for-the-badge&logo=css3&logoColor=white)
![NODE.JS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MYSQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
