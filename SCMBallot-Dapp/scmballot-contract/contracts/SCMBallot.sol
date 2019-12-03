pragma solidity ^0.5.2;
contract SCMBallot{
    struct Voter{
        bool voted;
        bool authorized;
        uint vote;
        uint weight;
        uint count;
        uint num_of_Votes;
    }
    struct Strat_Proposal{
        uint voteCount;
    }
    struct PT_Proposal{
        uint voteCount;
    }
    struct FM_Proposal{
        uint voteCount;
    }
    struct Other_CLub_Proposal{
        uint voteCount;
    }

    address soccerclub;
    mapping(address => Voter) voters;
    Strat_Proposal[] st_proposals;
    PT_Proposal[] pt_proposals;
    FM_Proposal[] ft_proposals;
    Other_CLub_Proposal[] ot_proposals ;

    uint num_of_fans;
    uint num_of_Votes;
    uint votercount = 0;
    uint flag;
    uint total_votes = 0;
    uint total_count = 0;

    enum State{Add,Register,Voting,Results}
    State private state;

    enum Decision{FriendlyM,PlayerT,Strategy,Other}
    Decision public dec;

    modifier soccerClubOnly(){
        require(msg.sender == soccerclub);
        _;
    }

    modifier inState(State _state){
        require(state == _state);
        _;
    }

    constructor(uint number_of_fans) public{
        soccerclub = msg.sender;
        num_of_fans = number_of_fans;
        state = State.Add;
    }

    function Switch(uint _dec) inState(State.Voting) public{
        require(msg.sender != soccerclub);
        require(!voters[msg.sender].voted);
        if(_dec == 0){
            dec = Decision.FriendlyM;
        }
        else if(_dec == 1){
            dec = Decision.PlayerT;
        }
        else if(_dec == 2){
            dec = Decision.Strategy;
        }
        else{
            dec = Decision.Other;
        }
    }


    function Strategy(uint Prop) inState(State.Add) soccerClubOnly public{
        st_proposals.length = Prop;
        flag+=1;
        if(flag==4){
            state = State.Register;
        }

    }

    function PlayerTransfer(uint Prop) inState(State.Add) soccerClubOnly public{
        pt_proposals.length = Prop;
        flag+=1;
        if(flag==4){
            state = State.Register;
        }
    }

    function FriendlyMt(uint Prop) inState(State.Add) soccerClubOnly public{
        ft_proposals.length = Prop;
        flag+=1;
        if(flag==4){
            state = State.Register;
        }
    }

    function Other_ClubA(uint Prop) inState(State.Add) soccerClubOnly public{
        ot_proposals.length = Prop;
        flag+=1;
        if(flag==4){
            state = State.Register;
        }
    }

    function Auth_Num_Votes(address _person,uint number_of_Votes) inState(State.Register) soccerClubOnly public {
        require(votercount < num_of_fans);
        require(!voters[_person].voted);
        require(!voters[_person].authorized);
        voters[_person].weight = 1;
        voters[_person].authorized = true;
        votercount += 1;
        total_votes += number_of_Votes;
        voters[_person].num_of_Votes = number_of_Votes;
        if(votercount == num_of_fans){
            state = State.Voting;
        }
    }



    function castVote(uint _proposal) inState(State.Voting) public{
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0);
        require(!sender.voted);
        sender.count += sender.weight;
        if(sender.count == sender.num_of_Votes){
        sender.voted = true;
        }
        sender.vote = _proposal;
        if(dec == Decision.Strategy){
            st_proposals[_proposal].voteCount += sender.weight;
        }
        else if(dec == Decision.PlayerT ){
            pt_proposals[_proposal].voteCount +=sender.weight;
        }
        else if(dec == Decision.FriendlyM){
            ft_proposals[_proposal].voteCount += sender.weight;
        }
        else if(dec == Decision.Other){
            ot_proposals[_proposal].voteCount += sender.weight;
        }
        total_count += 1;
        if(total_count == total_votes){
            state = State.Results;
        }
    }

    function BestStrategy() inState(State.Results) soccerClubOnly public view returns (uint BestStrategy_){
        uint winningVoteCount = 0;
        for (uint p = 0; p < st_proposals.length; p++) {
            if (st_proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = st_proposals[p].voteCount;
                BestStrategy_ = p;
            }
        }
    }

    function BestPlayerT() inState(State.Results) soccerClubOnly public view returns (uint BestPlayerT_){
        uint winningVoteCount = 0;
        for (uint p = 0; p < pt_proposals.length; p++) {
            if (pt_proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = pt_proposals[p].voteCount;
                BestPlayerT_ = p;
            }
        }
    }

    function BestFriendlyM() inState(State.Results) soccerClubOnly public view returns (uint BestFriendlyM_){

        uint winningVoteCount = 0;
        for (uint p = 0; p < ft_proposals.length; p++) {
            if (ft_proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = ft_proposals[p].voteCount;
                BestFriendlyM_ = p;
            }
        }
    }

    function currentPhase() public view returns(uint _state){
        if(state == State.Add){_state = 0;}
        else if(state == State.Register){_state = 1;}
        else if(state == State.Voting){_state = 2;}
        else if(state == State.Results){_state = 3;}
    }

    function BestOtherClubA() inState(State.Results) soccerClubOnly public view returns (uint BestOtherClubA_){
        uint winningVoteCount = 0;
        for (uint p = 0; p < ot_proposals.length; p++) {
            if (ot_proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = ot_proposals[p].voteCount;
                BestOtherClubA_ = p;
            }
        }
    }
}
