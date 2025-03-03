import layout from "../../styles/Layout.module.scss"
import cs from "classnames"
import Link, { LinkProps } from "next/link"
import { PropsWithChildren, HTMLAttributes } from "react";
import { User } from "../../types/entities/User";
import { Spacing } from "../../components/Layout/Spacing"
import { getUserProfileLink } from "../../utils/user"
import { checkIsTabKeyActive, Tabs } from "../../components/Layout/Tabs"
import { UserCollectionGentks } from "./Collection/Gentks"
import { UserCollectionArticles } from "./Collection/Articles"

type TabWrapperProps = PropsWithChildren<LinkProps> & HTMLAttributes<HTMLAnchorElement>
const TabWrapper = ({ children, ...props }: TabWrapperProps) => (
  <Link {...props}>
    <a className={props.className}>{ children }</a>
  </Link>
)

interface Props {
  user: User,
  activeTab: 'gentk' | 'articles'
}
export function UserCollection({
  user,
  activeTab,
}: Props) {
  // TABS href are computed using the user profile URL
  const TABS = [
    {
      key: "gentk",
      name: "gentk",
      props: {
        scroll: false,
        href: `${getUserProfileLink(user)}/collection/`
      }
    },
    {
      key: "articles",
      name: "articles",
      props: {
        scroll: false,
        href: `${getUserProfileLink(user)}/collection/articles/`
      }
    },
  ]
  
  return (
    <>
      <Spacing size="2x-small"/>

      <Tabs
        tabDefinitions={TABS}
        checkIsTabActive={checkIsTabKeyActive}
        activeIdx={activeTab}
        tabsLayout="subtabs-vertical"
        tabsClassName={cs(layout['padding-big'])}
        tabWrapperComponent={TabWrapper}
      />
      
      {activeTab === "gentk" && (
        <UserCollectionGentks
          user={user}
        />
      )}

      {activeTab === "articles" && ( 
        <>
          <Spacing size="x-large"/>
          <UserCollectionArticles
            user={user}
          />
        </>
      )}
    </>
  )
}
