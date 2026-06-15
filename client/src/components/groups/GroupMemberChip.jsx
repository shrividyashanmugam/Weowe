import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'

export default function GroupMemberChip({ member }) {
  return (
    <div className="flex items-center gap-2 bg-wbg rounded-xl px-3 py-2">
      <Avatar src={member.user?.avatar} name={member.user?.name} size="sm" />
      <span className="text-sm font-medium text-gray-700">{member.user?.name}</span>
      {member.role === 'owner' && <Badge variant="primary">Owner</Badge>}
    </div>
  )
}
