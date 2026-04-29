from backend import crud, schemas
from backend import models


def test_create_and_query_topic(db_session):
    topic_input = schemas.TopicCreate(topic_name="Python", topic_description="A programming language")
    created_topic = crud.create_topic(db_session, topic=topic_input)

    assert created_topic.id is not None
    assert created_topic.topic_name == "Python"
    assert created_topic.topic_description == "A programming language"
    assert crud.get_topic_by_name(db_session, "Python").id == created_topic.id
    assert crud.get_topic(db_session, created_topic.id).topic_name == "Python"
    assert len(crud.get_topics(db_session)) == 1


def test_create_update_delete_tag(db_session):
    tag_input = schemas.TagCreate(tag_name="backend")
    created_tag = crud.create_tag(db_session, tag=tag_input)

    assert created_tag.id is not None
    assert created_tag.tag_name == "backend"

    updated_tag = crud.update_tag(db_session, created_tag.id, schemas.TagCreate(tag_name="backend-updated"))
    assert updated_tag.tag_name == "backend-updated"

    removed_tag = crud.delete_tag(db_session, created_tag.id)
    assert removed_tag.id == created_tag.id
    assert crud.get_tag(db_session, created_tag.id) is None


def test_create_knowledge_source_with_tags(db_session):
    topic = crud.create_topic(db_session, schemas.TopicCreate(topic_name="Databases", topic_description="Persistent storage"))
    tag1 = crud.create_tag(db_session, schemas.TagCreate(tag_name="sql"))
    tag2 = crud.create_tag(db_session, schemas.TagCreate(tag_name="orm"))

    source_input = schemas.KnowledgeSourceCreate(
        title="SQLAlchemy Guide",
        source_url="https://example.com/sqlalchemy",
        content="SQLAlchemy is a Python ORM.",
        topic_id=topic.id,
        tags=[tag1.id, tag2.id],
    )

    created_source = crud.create_knowledge_source(db_session, source=source_input)

    assert created_source.id is not None
    assert created_source.title == "SQLAlchemy Guide"
    assert created_source.topic_id == topic.id
    assert {tag.tag_name for tag in created_source.tags} == {"sql", "orm"}


def test_create_interview_session_and_qna(db_session):
    user = crud.create_user(
        db_session,
        schemas.UserCreate(username="testuser", email="test@example.com", password="secret", role=models.UserRole.CANDIDATE),
    )
    topic = crud.create_topic(db_session, schemas.TopicCreate(topic_name="Algorithms"))
    session_obj = crud.create_interview_session(
        db_session,
        schemas.InterviewSessionCreate(user_id=user.id, topic_id=topic.id),
    )

    assert session_obj.id is not None
    assert session_obj.user_id == user.id
    assert session_obj.topic_id == topic.id

    qna = crud.create_session_qna(
        db_session,
        schemas.SessionQnACreate(question_text="What is dynamic programming?", user_answer_text="A method for optimization."),
        session_obj.id,
    )

    assert qna.id is not None
    assert qna.session_id == session_obj.id
    assert qna.question_text == "What is dynamic programming?"

    sessions_by_user = crud.get_interview_sessions_by_user(db_session, user_id=user.id)
    assert len(sessions_by_user) == 1
    assert sessions_by_user[0].id == session_obj.id
